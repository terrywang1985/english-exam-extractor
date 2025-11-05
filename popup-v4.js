// 英语试卷提取器 v4.0 - 支持完整试卷和答案页导出

document.addEventListener('DOMContentLoaded', function() {
  const exportHTMLBtn = document.getElementById('exportHTMLBtn');
  const exportAnswerBtn = document.getElementById('exportAnswerBtn');
  const statusDiv = document.getElementById('status');
  
  // 完整试卷导出事件
  exportHTMLBtn.addEventListener('click', async function() {
    await handleExport('full');
  });
  
  // 答案页导出事件
  exportAnswerBtn.addEventListener('click', async function() {
    await handleExport('answer');
  });
  
  // 通用导出处理函数
  async function handleExport(type) {
    const isFull = type === 'full';
    const btn = isFull ? exportHTMLBtn : exportAnswerBtn;
    const actionText = isFull ? '完整试卷' : '答案页';
    
    setStatus(`正在提取${actionText}内容...`, 'loading');
    btn.disabled = true;
    
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (isFull) {
        // 导出完整试卷
        await exportFullExam(tab);
      } else {
        // 导出答案页
        await exportAnswerSheet(tab);
      }
      
    } catch (error) {
      console.error(`导出${actionText}时出错:`, error);
      setStatus(`导出失败: ${error.message}`, 'error');
    } finally {
      btn.disabled = false;
    }
  }
  
  // 导出完整试卷
  async function exportFullExam(tab) {
    setStatus('正在生成完整试卷...', 'loading');
    
    // 注入HTML提取脚本 - 使用v4完整修复版
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['html-extractor-v4.js']
    });
    
    // 请求提取完整HTML内容
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractHTML" });
    
    if (response && response.success && response.data) {
      setStatus('正在生成HTML文件...', 'loading');
      
      // 生成文件名
      const title = response.title || '英语试卷';
      const cleanTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      const filename = `${cleanTitle}_完整版_${new Date().toISOString().slice(0,10)}.html`;
      
      // 下载HTML文件
      downloadHTML(response.data, filename);
      
      setStatus('✅ 完整试卷已下载！可直接打印', 'success');
      
      // 3秒后清除状态
      setTimeout(() => {
        setStatus('', '');
      }, 3000);
      
    } else {
      throw new Error(response?.error || '未能提取到试卷内容');
    }
  }
  
  // 导出答案页
  async function exportAnswerSheet(tab) {
    setStatus('正在生成答案页...', 'loading');
    
    // 注入HTML提取脚本
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['html-extractor-v4.js']
    });
    
    // 请求提取答案页内容
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractAnswerSheet" });
    
    if (response && response.success && response.data) {
      setStatus('正在生成答案页文件...', 'loading');
      
      // 生成文件名
      const title = response.title || '英语试卷';
      const cleanTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      const filename = `${cleanTitle}_答案页_${new Date().toISOString().slice(0,10)}.html`;
      
      // 下载HTML文件
      downloadHTML(response.data, filename);
      
      setStatus('✅ 答案页已下载！可单独打印', 'success');
      
      // 3秒后清除状态
      setTimeout(() => {
        setStatus('', '');
      }, 3000);
      
    } else {
      throw new Error(response?.error || '未能提取到答案内容');
    }
  }
  
  // 下载HTML文件
  function downloadHTML(htmlContent, filename) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, function(downloadId) {
      console.log('下载开始，ID:', downloadId);
      // 清理URL对象
      setTimeout(() => URL.revokeObjectURL(url), 100);
    });
  }
  
  // 设置状态消息
  function setStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status';
    if (type) {
      statusDiv.classList.add(type);
    }
  }
});