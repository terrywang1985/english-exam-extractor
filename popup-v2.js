// 英语试卷提取器 v2.0 - 支持HTML和PDF导出
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
  const exportHTMLBtn = document.getElementById('exportHTMLBtn');
  const exportPDFBtn = document.getElementById('exportPDFBtn');
  const statusDiv = document.getElementById('status');
  
  // HTML导出事件
  exportHTMLBtn.addEventListener('click', async function() {
    await handleExport('html');
  });
  
  // PDF导出事件
  exportPDFBtn.addEventListener('click', async function() {
    await handleExport('pdf');
  });
  
  // 通用导出处理函数
  async function handleExport(type) {
    const isHTML = type === 'html';
    const btn = isHTML ? exportHTMLBtn : exportPDFBtn;
    const actionText = isHTML ? 'HTML' : 'PDF';
    
    setStatus(`正在提取试卷内容...`, 'loading');
    btn.disabled = true;
    
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (isHTML) {
        // HTML导出
        await exportAsHTML(tab);
      } else {
        // PDF导出
        await exportAsPDF(tab);
      }
      
    } catch (error) {
      console.error(`导出${actionText}时出错:`, error);
      setStatus(`导出失败: ${error.message}`, 'error');
    } finally {
      btn.disabled = false;
    }
  }
  
  // HTML导出功能
  async function exportAsHTML(tab) {
    setStatus('正在提取HTML内容...', 'loading');
    
    // 注入HTML提取脚本 - 使用v4完整修复版
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['html-extractor-v4.js']
    });
    
    // 请求提取HTML内容
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractHTML" });
    
    if (response && response.success && response.data) {
      setStatus('正在生成HTML文件...', 'loading');
      
      // 生成文件名
      const title = response.title || '英语试卷';
      const cleanTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      const filename = `${cleanTitle}_${new Date().toISOString().slice(0,10)}.html`;
      
      // 下载HTML文件
      downloadHTML(response.data, filename);
      
      setStatus('HTML文件已下载完成！可直接打开打印', 'success');
      
      // 3秒后清除状态
      setTimeout(() => {
        setStatus('', '');
      }, 3000);
      
    } else {
      throw new Error(response?.error || '未能提取到试卷内容');
    }
  }
  
  // PDF导出功能（改进版）
  async function exportAsPDF(tab) {
    setStatus('正在提取PDF内容...', 'loading');
    
    // 使用原有的content.js进行内容提取
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractContent" });
    
    if (response && response.data) {
      setStatus('正在生成PDF...', 'loading');
      await generateImprovedPDF(response.data);
    } else {
      throw new Error('未能提取到试卷内容');
    }
  }
  
  // 改进的PDF生成功能
  async function generateImprovedPDF(examData) {
    try {
      // 创建PDF文档
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 加载中文字体支持（使用内置字体）
      doc.addFont('https://cdn.jsdelivr.net/npm/source-han-serif-simplified-chinese@1.0.0/SubsetOTF/SourceHanSerifSC-Regular.otf', 'SourceHanSerif', 'normal');
      doc.setFont('SourceHanSerif');
      
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 8;
      
      // 添加标题
      doc.setFontSize(18);
      doc.text(examData.title || '英语试卷', pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;
      
      // 添加提取时间
      doc.setFontSize(10);
      doc.text(`提取时间: ${new Date().toLocaleString('zh-CN')}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;
      
      // 添加各部分题目
      examData.sections.forEach(section => {
        // 检查是否需要新页面
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        
        // 添加题型标题
        doc.setFontSize(14);
        doc.setFont('SourceHanSerif', 'bold');
        doc.text(section.type || '题目', margin, yPosition);
        yPosition += 10;
        
        // 添加题目
        doc.setFontSize(12);
        doc.setFont('SourceHanSerif', 'normal');
        
        section.questions.forEach((question, index) => {
          // 检查是否需要新页面
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
          }
          
          // 添加题号和题目内容
          let questionText = `${question.number || (index + 1)} ${question.content || ''}`.trim();
          
          // 简化处理长文本
          const maxWidth = pageWidth - 2 * margin;
          const lines = doc.splitTextToSize(questionText, maxWidth);
          
          lines.forEach(line => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
          
          // 添加选项
          if (question.options && question.options.length > 0) {
            question.options.forEach(option => {
              if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
              }
              
              const optionText = `  ${option.text}`;
              doc.text(optionText, margin + 5, yPosition);
              yPosition += lineHeight;
            });
          }
          
          yPosition += 5;
        });
        
        yPosition += 10;
      });
      
      // 生成文件名
      const fileName = (examData.title || '英语试卷').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '.pdf';
      
      // 下载PDF
      doc.save(fileName);
      
      setStatus('PDF已下载完成！', 'success');
      
      // 3秒后清除状态
      setTimeout(() => {
        setStatus('', '');
      }, 3000);
      
    } catch (error) {
      console.error('生成PDF时出错:', error);
      setStatus('PDF生成失败，建议使用HTML格式', 'error');
    }
  }
  
  // 下载HTML文件
  function downloadHTML(content, filename) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // 使用Chrome下载API
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, (downloadId) => {
      URL.revokeObjectURL(url);
    });
  }
  
  // 设置状态显示
  function setStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }
  
  // 初始化检查
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (!currentTab.url.includes('jyeoo.com') && !currentTab.url.includes('localhost')) {
      setStatus('请在试卷页面使用此插件', 'error');
      exportHTMLBtn.disabled = true;
      exportPDFBtn.disabled = true;
    }
  });
});