// 试卷HTML提取器 - 保留原始样式和格式
function extractExamAsHTML() {
  try {
    // 1. 提取试卷标题
    const titleElement = document.querySelector('title');
    const examTitle = titleElement ? titleElement.textContent.trim() : '英语试卷';
    
    // 2. 创建新的HTML文档结构
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
            line-height: 1.6;
            margin: 20px;
            background: white;
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
            color: #333;
            border-left: 4px solid #0066cc;
            padding-left: 10px;
            margin-bottom: 15px;
        }
        
        .question-item {
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 5px;
            background: #fafafa;
        }
        
        .question-number {
            font-weight: bold;
            color: #0066cc;
            margin-right: 5px;
        }
        
        .question-content {
            margin-bottom: 10px;
            line-height: 1.8;
        }
        
        .question-options {
            margin-left: 20px;
        }
        
        .option-item {
            margin: 5px 0;
            padding: 3px 8px;
            border-radius: 3px;
        }
        
        .option-correct {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            font-weight: bold;
        }
        
        .question-answer {
            margin-top: 10px;
            padding: 8px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 3px;
            font-weight: bold;
        }
        
        .math-formula {
            font-family: "Times New Roman", serif;
        }
        
        .underline-blank {
            border-bottom: 2px solid #333;
            min-width: 80px;
            display: inline-block;
            margin: 0 3px;
        }
        
        .export-info {
            margin-top: 30px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        
        @page {
            margin: 1cm;
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
        <p>本试卷由英语试卷提取器自动生成 | 支持打印 | 建议使用Chrome浏览器打印</p>
        <p>打印设置：选择"更多设置" → 取消勾选"页眉和页脚" → 选择"背景图形"</p>
    </div>
</body>
</html>`;

    // 3. 提取试卷内容
    const extractedContent = extractQuestions();
    
    // 4. 构建完整的HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlTemplate, 'text/html');
    const contentContainer = doc.getElementById('exam-content');
    
    if (extractedContent.sections.length > 0) {
      extractedContent.sections.forEach(section => {
        const sectionDiv = doc.createElement('div');
        sectionDiv.className = 'question-section';
        
        // 添加题型标题
        if (section.type && section.type.trim() !== '') {
          const titleDiv = doc.createElement('div');
          titleDiv.className = 'section-title';
          titleDiv.textContent = section.type;
          sectionDiv.appendChild(titleDiv);
        }
        
        // 添加题目
        section.questions.forEach(question => {
          const questionDiv = doc.createElement('div');
          questionDiv.className = 'question-item';
          
          // 题目内容
          const contentDiv = doc.createElement('div');
          contentDiv.className = 'question-content';
          
          // 处理题号和内容
          const questionText = `${question.number || ''} ${question.content || ''}`.trim();
          contentDiv.innerHTML = processQuestionContent(questionText);
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
    } else {
      // 如果没有找到结构化内容，尝试直接复制主要内容区域
      const fallbackContent = extractFallbackContent();
      contentContainer.innerHTML = fallbackContent;
    }
    
    return doc.documentElement.outerHTML;
    
  } catch (error) {
    console.error('提取HTML时出错:', error);
    return null;
  }
}

// 改进的题目提取函数
function extractQuestions() {
  const sections = [];
  
  // 查找所有题型标题（h3.ques-type）
  const sectionTitles = document.querySelectorAll('h3.ques-type');
  console.log('找到题型标题数量:', sectionTitles.length);
  
  if (sectionTitles.length > 0) {
    // 按题型分组提取
    sectionTitles.forEach(titleEl => {
      const sectionTitle = titleEl.textContent.trim();
      const section = {
        type: sectionTitle,
        questions: []
      };
      
      // 查找该题型下的所有题目
      let nextEl = titleEl.nextElementSibling;
      while (nextEl && nextEl.tagName !== 'H3') {
        // 检查是否是题目列表容器
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
    // 如果没有题型标题，直接提取所有题目
    const allQuestions = document.querySelectorAll('li.QUES_LI');
    console.log('找到题目数量:', allQuestions.length);
    
    if (allQuestions.length > 0) {
      const section = {
        type: "试卷题目",
        questions: []
      };
      
      allQuestions.forEach((questionEl, index) => {
        const questionData = extractSingleQuestion(questionEl, "试卷题目");
        if (questionData) {
          section.questions.push(questionData);
        }
      });
      
      sections.push(section);
    }
  }
  
  return { sections };
}

// 提取单个题目的详细信息
function extractSingleQuestion(questionElement) {
  try {
    const question = {};
    
    // 提取题号
    const numberEl = questionElement.querySelector('.qseq');
    question.number = numberEl ? numberEl.textContent.trim() : '';
    
    // 提取题目内容 - 改进版本
    const contentEl = questionElement.querySelector('.pt1');
    if (contentEl) {
      // 克隆元素避免修改原页面
      const clone = contentEl.cloneNode(true);
      
      // 移除不需要的元素
      clone.querySelectorAll('.qseq, .sanwser, .quizPutTag, table').forEach(el => el.remove());
      
      // 获取纯文本内容
      let content = clone.textContent || clone.innerText || '';
      content = content.replace(/\s+/g, ' ').trim();
      
      // 处理下划线空白
      content = content.replace(/_{3,}/g, '________');
      
      question.content = content;
    }
    
    // 提取选项
    const optionsTable = questionElement.querySelector('table.ques');
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
    
    return question;
    
  } catch (error) {
    console.error('提取单个题目时出错:', error);
    return null;
  }
}

// 处理题目内容格式
function processQuestionContent(content) {
  if (!content) return '';
  
  // 处理下划线空白
  content = content.replace(/_{3,}/g, '<span class="underline-blank"></span>');
  
  // 处理换行
  content = content.replace(/\n/g, '<br>');
  
  // 处理数学公式标记（如果存在）
  content = content.replace(/\$([^$]+)\$/g, '<span class="math-formula">$1</span>');
  
  return content;
}

// 备用内容提取方法
function extractFallbackContent() {
  // 尝试找到主要内容区域
  const mainContent = document.querySelector('.wrapper.clearfix') || 
                     document.querySelector('#divBread').nextElementSibling ||
                     document.body;
  
  if (mainContent) {
    const clone = mainContent.cloneNode(true);
    
    // 移除不需要的元素
    clone.querySelectorAll('script, .top, .nav-menu, .bread, .fieldtip').forEach(el => {
      el.remove();
    });
    
    return clone.innerHTML;
  }
  
  return '<p>未能提取到试卷内容，请检查页面结构。</p>';
}

// 导出为HTML文件
function downloadHTML(content, filename) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // 清理
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractHTML") {
    try {
      const htmlContent = extractExamAsHTML();
      sendResponse({ 
        success: true, 
        data: htmlContent,
        title: document.title
      });
    } catch (error) {
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
  }
});