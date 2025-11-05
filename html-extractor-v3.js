// 试卷HTML提取器 v2.2 - 最终修复版
function extractExamAsHTML() {
  try {
    const titleElement = document.querySelector('title');
    const examTitle = titleElement ? titleElement.textContent.trim() : '英语试卷';
    
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examTitle}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            .page-break { page-break-after: always; }
        }
        
        body {
            font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
            line-height: 1.8;
            margin: 20px;
            background: white;
            color: #333;
        }
        
        .exam-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .exam-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .exam-info {
            font-size: 14px;
            color: #666;
        }
        
        .question-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #fff;
            background: #0066cc;
            padding: 10px 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        
        .question-item {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #fafafa;
            page-break-inside: avoid;
        }
        
        .question-content {
            margin-bottom: 12px;
            line-height: 2;
            font-size: 15px;
        }
        
        /* 下划线空白样式 - 只用一种 */
        .answer-blank {
            text-decoration: underline;
            text-decoration-style: solid;
            text-decoration-thickness: 1px;
            text-underline-offset: 3px;
            display: inline;
            min-width: 60px;
            padding: 0 10px;
        }
        
        /* 完形填空样式 */
        .cloze-passage {
            line-height: 2.2;
            margin: 15px 0;
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .cloze-passage p {
            text-indent: 2em;
            margin: 10px 0;
        }
        
        .cloze-blank {
            font-weight: bold;
            color: #0066cc;
            margin: 0 2px;
        }
        
        /* 完形填空选项表格 */
        .cloze-options-table {
            width: 100%;
            margin: 15px 0;
            border-collapse: collapse;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        
        .cloze-options-table td {
            padding: 10px;
            border: 1px solid #dee2e6;
            line-height: 1.8;
        }
        
        .cloze-options-table td:first-child {
            font-weight: bold;
            color: #0066cc;
            width: 40px;
            text-align: center;
        }
        
        /* 普通选项 */
        .question-options {
            margin-left: 20px;
            margin-top: 10px;
        }
        
        .option-item {
            margin: 8px 0;
            padding: 5px 10px;
            border-radius: 3px;
            line-height: 1.6;
        }
        
        .option-correct {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            font-weight: bold;
        }
        
        .question-answer {
            margin-top: 12px;
            padding: 10px;
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 3px;
        }
        
        /* 阅读理解样式 */
        .reading-content {
            line-height: 2;
            margin: 15px 0;
        }
        
        .reading-content p {
            margin: 12px 0;
        }
        
        .reading-section {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        .export-info {
            margin-top: 40px;
            padding: 15px;
            background: #e9ecef;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            font-size: 12px;
            color: #666;
            text-align: center;
            line-height: 1.8;
        }
        
        @page {
            margin: 1.5cm;
        }
    </style>
</head>
<body>
    <div class="exam-header">
        <div class="exam-title">${examTitle}</div>
        <div class="exam-info">提取时间：${new Date().toLocaleString('zh-CN')}</div>
    </div>
    
    <div id="exam-content">
        <!-- 试卷内容将在这里插入 -->
    </div>
    
    <div class="export-info no-print">
        <p><strong>本试卷由英语试卷提取器自动生成</strong></p>
        <p>支持浏览器打印 | 建议使用Chrome浏览器</p>
        <p>打印设置：选择"更多设置" → 取消勾选"页眉和页脚" → 勾选"背景图形"</p>
    </div>
</body>
</html>`;

    const extractedContent = extractQuestionsBySection();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlTemplate, 'text/html');
    const contentContainer = doc.getElementById('exam-content');
    
    if (extractedContent.sections.length > 0) {
      extractedContent.sections.forEach(section => {
        const sectionDiv = doc.createElement('div');
        sectionDiv.className = 'question-section';
        
        if (section.type && section.type.trim() !== '') {
          const titleDiv = doc.createElement('div');
          titleDiv.className = 'section-title';
          titleDiv.textContent = section.type;
          sectionDiv.appendChild(titleDiv);
        }
        
        section.questions.forEach(question => {
          const questionDiv = doc.createElement('div');
          questionDiv.className = 'question-item';
          
          const contentDiv = doc.createElement('div');
          contentDiv.className = 'question-content';
          
          if (question.contentHTML) {
            contentDiv.innerHTML = question.contentHTML;
          } else {
            contentDiv.textContent = `${question.number || ''} ${question.content || ''}`.trim();
          }
          
          questionDiv.appendChild(contentDiv);
          
          // 添加选项
          if (question.options && question.options.length > 0) {
            const optionsDiv = doc.createElement('div');
            optionsDiv.className = 'question-options';
            
            question.options.forEach(option => {
              const optionDiv = doc.createElement('div');
              optionDiv.className = option.isCorrect ? 'option-item option-correct' : 'option-item';
              optionDiv.textContent = option.text;
              optionsDiv.appendChild(optionDiv);
            });
            
            questionDiv.appendChild(optionsDiv);
          }
          
          // 添加完形填空选项表格
          if (question.clozeOptionsHTML) {
            const optionsTableDiv = doc.createElement('div');
            optionsTableDiv.innerHTML = question.clozeOptionsHTML;
            questionDiv.appendChild(optionsTableDiv);
          }
          
          // 添加答案
          if (question.answer && question.answer.trim() !== '') {
            const answerDiv = doc.createElement('div');
            answerDiv.className = 'question-answer';
            answerDiv.innerHTML = `<strong>答案：</strong>${question.answer}`;
            questionDiv.appendChild(answerDiv);
          }
          
          sectionDiv.appendChild(questionDiv);
        });
        
        contentContainer.appendChild(sectionDiv);
      });
    }
    
    return doc.documentElement.outerHTML;
    
  } catch (error) {
    console.error('提取HTML时出错:', error);
    return null;
  }
}

// 按题型提取题目
function extractQuestionsBySection() {
  const sections = [];
  const sectionTitles = document.querySelectorAll('h3.ques-type');
  
  console.log('找到题型标题数量:', sectionTitles.length);
  
  if (sectionTitles.length > 0) {
    sectionTitles.forEach(titleEl => {
      const sectionTitle = titleEl.textContent.trim();
      const section = {
        type: sectionTitle,
        questions: []
      };
      
      let nextEl = titleEl.nextElementSibling;
      while (nextEl && nextEl.tagName !== 'H3') {
        const questionElements = nextEl.querySelectorAll('li.QUES_LI');
        if (questionElements.length > 0) {
          questionElements.forEach(qEl => {
            const questionData = extractSingleQuestion(qEl, sectionTitle);
            if (questionData) {
              section.questions.push(questionData);
            }
          });
        }
        nextEl = nextEl.nextElementSibling;
      }
      
      if (section.questions.length > 0) {
        sections.push(section);
      }
    });
  } else {
    const allQuestions = document.querySelectorAll('li.QUES_LI');
    if (allQuestions.length > 0) {
      const section = {
        type: "试卷题目",
        questions: []
      };
      
      allQuestions.forEach(qEl => {
        const questionData = extractSingleQuestion(qEl, "试卷题目");
        if (questionData) {
          section.questions.push(questionData);
        }
      });
      
      sections.push(section);
    }
  }
  
  return { sections };
}

// 提取单个题目
function extractSingleQuestion(questionElement, sectionType) {
  try {
    const question = {};
    const isCloze = sectionType && sectionType.includes('完形填空');
    const isReading = sectionType && sectionType.includes('阅读');
    
    question.isCloze = isCloze;
    question.isReading = isReading;
    
    // 提取题号
    const numberEl = questionElement.querySelector('.qseq');
    question.number = numberEl ? numberEl.textContent.trim() : '';
    
    // 提取题目内容
    const contentEl = questionElement.querySelector('.pt1');
    if (!contentEl) return null;
    
    const clone = contentEl.cloneNode(true);
    
    // 移除题号
    const qseqClone = clone.querySelector('.qseq');
    if (qseqClone) qseqClone.remove();
    
    if (isCloze) {
      // ===== 完形填空处理 =====
      console.log('处理完形填空题目');
      
      // 先提取选项表格（在移除之前）
      const optionsTable = clone.querySelector('table.composition2');
      if (optionsTable) {
        // 保存选项表格HTML
        const tableClone = optionsTable.cloneNode(true);
        question.clozeOptionsHTML = `<table class="cloze-options-table">${tableClone.innerHTML}</table>`;
        optionsTable.remove();
      }
      
      // 移除不需要的元素
      clone.querySelectorAll('.quizPutTag').forEach(el => el.remove());
      
      // 处理内容
      let htmlContent = clone.innerHTML;
      
      // 替换答案为空白（不显示答案字母）
      htmlContent = htmlContent.replace(/<div class="sanwser">[^<]*<\/div>/g, '');
      
      // 处理题号标记（16）（17）等 - 只保留题号，不加下划线
      htmlContent = htmlContent.replace(/（(\d+)）<!--BA-->/g, '<span class="cloze-blank">（$1）</span>');
      
      // 清理注释
      htmlContent = htmlContent.replace(/<!--.*?-->/g, '');
      
      // 处理段落：将<br>转换为<p>标签
      const paragraphs = htmlContent.split('<br>').filter(p => p.trim());
      const formattedContent = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
      
      question.contentHTML = `<div class="cloze-passage">${formattedContent}</div>`;
      
    } else if (isReading) {
      // ===== 阅读理解处理 =====
      console.log('处理阅读理解题目');
      
      // 移除选项表格（阅读理解的选项在题目下方，不在内容中）
      clone.querySelectorAll('table').forEach(table => table.remove());
      
      // 移除答案和标记
      clone.querySelectorAll('.sanwser, .quizPutTag').forEach(el => el.remove());
      
      // 获取HTML内容
      let htmlContent = clone.innerHTML;
      
      // 清理注释
      htmlContent = htmlContent.replace(/<!--.*?-->/g, '');
      
      // 保留<br>标签，转换为段落
      htmlContent = htmlContent.replace(/<br>/g, '</p><p>');
      
      // 处理下划线
      const underlines = clone.querySelectorAll('.mathjye-underline, bdo.mathjye-underline');
      underlines.forEach(el => {
        el.outerHTML = '<span class="answer-blank">________</span>';
      });
      
      question.contentHTML = `<div class="reading-content"><p>${htmlContent}</p></div>`;
      
    } else {
      // ===== 普通题目处理 =====
      
      // 移除选项表格
      clone.querySelectorAll('table').forEach(table => table.remove());
      
      // 移除答案
      clone.querySelectorAll('.sanwser, .quizPutTag').forEach(el => el.remove());
      
      // 处理下划线 - 关键：只处理真正的下划线，不处理题号
      const underlines = clone.querySelectorAll('.mathjye-underline, bdo[class*="underline"]');
      underlines.forEach(el => {
        el.outerHTML = '<span class="answer-blank">________</span>';
      });
      
      // 获取纯文本
      let content = clone.textContent || clone.innerText || '';
      content = content.replace(/\s+/g, ' ').trim();
      
      question.content = content;
    }
    
    // 提取选项（非完形填空）
    if (!isCloze) {
      const optionsTable = questionElement.querySelector('.pt2 table, table.ques');
      if (optionsTable) {
        question.options = [];
        const optionElements = optionsTable.querySelectorAll('.selectoption');
        
        optionElements.forEach(optionEl => {
          const isCorrect = optionEl.querySelector('.s.sh') !== null;
          const text = optionEl.textContent.trim();
          if (text) {
            question.options.push({
              text: text,
              isCorrect: isCorrect
            });
          }
        });
      }
      
      // 提取答案
      const answerEl = questionElement.querySelector('.sanwser');
      if (answerEl) {
        question.answer = answerEl.textContent.trim();
      }
    }
    
    // 验证
    if (!question.content && !question.contentHTML) {
      console.log('题目内容为空，跳过');
      return null;
    }
    
    return question;
    
  } catch (error) {
    console.error('提取单个题目时出错:', error);
    return null;
  }
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request.action);
  
  if (request.action === "extractHTML") {
    try {
      const htmlContent = extractExamAsHTML();
      sendResponse({ 
        success: true, 
        data: htmlContent,
        title: document.title
      });
    } catch (error) {
      console.error('提取HTML时出错:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return true;
});