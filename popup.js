// 引入jsPDF库
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const statusDiv = document.getElementById('status');
  
  extractBtn.addEventListener('click', async function() {
    setStatus('正在提取试卷内容...', 'loading');
    extractBtn.disabled = true;
    
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // 向内容脚本发送消息以提取试卷内容
      const response = await chrome.tabs.sendMessage(tab.id, { action: "extractContent" });
      
      if (response && response.data) {
        setStatus('正在生成PDF...', 'loading');
        generatePDF(response.data);
      } else {
        throw new Error('未能提取到试卷内容');
      }
    } catch (error) {
      console.error('提取试卷时出错:', error);
      setStatus('提取失败: ' + error.message, 'error');
      extractBtn.disabled = false;
    }
  });
  
  // 设置状态显示
  function setStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
  }
  
  // 生成PDF并提示下载
  function generatePDF(examData) {
    try {
      // 创建PDF文档，设置中文字体支持
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 设置字体和初始位置
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 8;
      
      // 添加标题（处理长标题换行）
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      
      // 处理标题换行
      const titleLines = doc.splitTextToSize(examData.title, pageWidth - 2 * margin);
      doc.text(titleLines, pageWidth / 2, yPosition, { align: "center" });
      yPosition += titleLines.length * 10 + 5;
      
      // 添加各部分题目
      examData.sections.forEach(section => {
        // 检查是否需要新页面
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        // 添加题型标题
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const sectionLines = doc.splitTextToSize(section.type, pageWidth - 2 * margin);
        doc.text(sectionLines, margin, yPosition);
        yPosition += sectionLines.length * lineHeight + 3;
        
        // 添加题目
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        if (section.questions.length === 0) {
          // 如果没有找到题目，显示提示信息
          doc.text("未找到题目", margin + 10, yPosition);
          yPosition += 10;
        }
        
        section.questions.forEach((question, index) => {
          // 检查是否需要新页面
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 20;
          }
          
          // 添加题号和题目内容
          let questionText = question.number + ' ' + question.content;
          
          // 处理长文本换行
          const splitText = doc.splitTextToSize(questionText, pageWidth - 2 * margin);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * lineHeight;
          
          // 添加选项（如果是选择题）
          if (question.options && question.options.length > 0) {
            question.options.forEach(option => {
              // 检查是否需要新页面
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
              }
              
              // 如果是正确答案，加粗显示
              if (option.isCorrect) {
                doc.setFont("helvetica", "bold");
              }
              
              const optionText = '  ' + option.text;
              const splitOptionText = doc.splitTextToSize(optionText, pageWidth - 2 * margin - 10);
              doc.text(splitOptionText, margin + 5, yPosition);
              yPosition += splitOptionText.length * lineHeight;
              
              // 恢复正常字体
              if (option.isCorrect) {
                doc.setFont("helvetica", "normal");
              }
            });
            yPosition += 3;
          }
          
          // 添加答案（如果存在）
          if (question.answer) {
            // 检查是否需要新页面
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = 20;
            }
            doc.setTextColor(255, 0, 0); // 红色显示答案
            doc.setFont("helvetica", "bold");
            const answerText = '答案: ' + question.answer;
            const splitAnswerText = doc.splitTextToSize(answerText, pageWidth - 2 * margin - 10);
            doc.text(splitAnswerText, margin + 10, yPosition);
            doc.setTextColor(0, 0, 0); // 恢复黑色
            doc.setFont("helvetica", "normal");
            yPosition += splitAnswerText.length * lineHeight;
          }
          
          yPosition += 5;
        });
        
        yPosition += 5;
      });
      
      // 生成PDF文件名
      const fileName = examData.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '.pdf';
      
      // 提示用户下载
      setStatus('PDF生成完成，准备下载...', 'success');
      
      // 创建下载链接并触发下载
      doc.save(fileName);
      
      // 3秒后重置按钮状态
      setTimeout(() => {
        extractBtn.disabled = false;
        setStatus('PDF已下载', 'success');
      }, 3000);
    } catch (error) {
      console.error('生成PDF时出错:', error);
      setStatus('PDF生成失败: ' + error.message, 'error');
      extractBtn.disabled = false;
    }
  }
});