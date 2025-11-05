// 试卷HTML提取器 v2.0 - 修复下划线和完形填空问题
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
        
        .question-number {
            font-weight: bold;
            color: #0066cc;
            margin-right: 5px;
        }
        
        .question-content {
            margin-bottom: 12px;
            line-height: 2;
            font-size: 15px;
        }
        
        /* 下划线空白 - 关键样式 */
        .answer-blank {
            border-bottom: 2px solid #000;
            display: inline-block;
            min-width: 100px;
            margin: 0 5px;
            padding: 0 10px;
        }
        
        /* 完形填空特殊样式 */
        .cloze-passage {
            line-height: 2.2;
            text-indent: 2em;
            margin: 15px 0;
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .cloze-blank {
            display: inline-block;
            margin: 0 3px;
            font-weight: bold;
            color: #0066cc;
        }
        
        .cloze-options {
            margin: 15px 0;
            padding: 15px;
            background: #f5f5f5;
            border-left: 4px solid #0066cc;
        }
        
        .cloze-option-item {
            margin: 8px 0;
            padding: 5px 10px;
            line-height: 1.6;
        }
        
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

    // 3. 提取试卷内容
    const extractedContent = extractQuestionsBySection();
    
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
          
          // 处理完形填空
          if (question.isCloze) {
            contentDiv.innerHTML = question.contentHTML;
          } else {
            // 普通题目
            const questionText = `${question.number || ''} ${question.content || ''}`.trim();
            contentDiv.innerHTML = processQuestionContent(questionText);
          }
          
          questionDiv.appendChild(contentDiv);
          
          // 添加选项
          if (question.options && question.options.length > 0) {
            const optionsDiv = doc.createElement('div');
            optionsDiv.className = question.isCloze ? 'cloze-options' : 'question-options';
            
            question.options.forEach(option => {
              const optionDiv = doc.createElement('div');
              optionDiv.className = option.isCorrect ? 
                'option-item option-correct' : 'option-item';
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
  
  // 查找所有题型标题
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
    // 没有题型标题，直接提取所有题目
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

// 提取单个题目的详细信息
function extractSingleQuestion(questionElement, sectionType) {
  try {
    const question = {};
    const isCloze = sectionType && sectionType.includes('完形填空');
    question.isCloze = isCloze;
    
    // 提取题号
    const numberEl = questionElement.querySelector('.qseq');
    question.number = numberEl ? numberEl.textContent.trim() : '';
    
    // 提取题目内容
    const contentEl = questionElement.querySelector('.pt1');
    if (!contentEl) {
      console.log('未找到pt1元素');
      return null;
    }
    
    // 克隆元素避免修改原页面
    const clone = contentEl.cloneNode(true);
    
    // 移除题号
    const qseqClone = clone.querySelector('.qseq');
    if (qseqClone) {
      qseqClone.remove();
    }
    
    // 移除选项表格（选项会单独提取）
    clone.querySelectorAll('table').forEach(table => table.remove());
    
    if (isCloze) {
      // 完形填空特殊处理
      clone.querySelectorAll('.quizPutTag').forEach(el => el.remove());
      
      // 提取所有嵌入的题号和答案
      const clozeOptions = [];
      let htmlContent = clone.innerHTML;
      
      // 查找所有嵌入答案
      const answerPattern = /（(\d+)）[^<]*<div class="sanwser">([^<]+)<\/div>/g;
      let match;
      while ((match = answerPattern.exec(htmlContent)) !== null) {
        clozeOptions.push({
          number: match[1],
          answer: match[2]
        });
      }
      
      // 替换答案标记为空白
      htmlContent = htmlContent.replace(/<div class="sanwser">([^<]+)<\/div>/g, 
        '<span class="answer-blank">________</span>');
      
      // 处理嵌入的题号
      htmlContent = htmlContent.replace(/（(\d+)）/g, 
        '<span class="cloze-blank">（$1）</span>');
      
      // 清理HTML注释
      htmlContent = htmlContent.replace(/<!--.*?-->/g, '');
      
      // 包装为段落
      question.contentHTML = `<div class="cloze-passage">${htmlContent}</div>`;
      
      // 保存完形填空的选项信息（如果有）
      if (clozeOptions.length > 0) {
        question.clozeAnswers = clozeOptions;
      }
      
    } else {
      // 普通题目处理
      clone.querySelectorAll('.sanwser, .quizPutTag').forEach(el => el.remove());
      
      // 处理下划线空白 - 重要！
      const underlines = clone.querySelectorAll('.mathjye-underline, bdo.mathjye-underline, bdo[class*="underline"]');
      underlines.forEach(el => {
        // 用特殊标记替换，后续会处理成样式
        el.outerHTML = '<span class="answer-blank">________</span>';
      });
      
      // 获取HTML内容
      let htmlContent = clone.innerHTML;
      
      // 清理HTML注释和多余空格
      htmlContent = htmlContent
        .replace(/<!--.*?-->/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      
      // 转换为纯文本（保留重要的HTML标记）
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      let content = tempDiv.textContent || tempDiv.innerText || '';
      content = content.replace(/\s+/g, ' ').trim();
      
      question.content = content;
      
      // 如果内容包含下划线标记，保留HTML
      if (htmlContent.includes('answer-blank') || htmlContent.includes('<br')) {
        question.contentHTML = htmlContent;
      }
    }
    
    // 提取选项（非完形填空）
    if (!isCloze) {
      const optionsTable = questionElement.querySelector('table.ques, .pt2 table');
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
    } else {
      // 完形填空：提取pt2中的选项
      const pt2El = questionElement.querySelector('.pt2');
      if (pt2El) {
        const optionItems = pt2El.querySelectorAll('.selectoption');
        if (optionItems.length > 0) {
          question.options = [];
          optionItems.forEach(opt => {
            const isCorrect = opt.querySelector('.s.sh') !== null;
            const text = opt.textContent.trim();
            if (text) {
              question.options.push({
                text: text,
                isCorrect: isCorrect
              });
            }
          });
        }
      }
    }
    
    // 验证题目数据
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

// 处理题目内容格式
function processQuestionContent(content) {
  if (!content) return '';
  
  // 处理换行
  content = content.replace(/\n/g, '<br>');
  
  // 确保下划线空白有正确的样式
  content = content.replace(/_{3,}/g, '<span class="answer-blank">________</span>');
  
  return content;
}

// 监听来自popup的消息
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
  
  return true; // 保持消息通道开放
});