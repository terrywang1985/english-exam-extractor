// 试卷HTML提取器 v4.0 - 完整修复版
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
        
        /* 下划线空白样式 */
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
            text-decoration: underline;
            text-underline-offset: 3px;
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
        
        /* 选词填空选项框 */
        .word-selection-box {
            background: #e7f3ff;
            border: 2px solid #0066cc;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            font-size: 15px;
            line-height: 1.8;
        }
        
        .word-selection-box::before {
            content: "选项：";
            font-weight: bold;
            color: #0066cc;
            display: block;
            margin-bottom: 8px;
        }
        
        /* 首字母填空样式 */
        .initial-letter-blank {
            font-weight: bold;
            color: #0066cc;
            text-decoration: underline;
            text-decoration-style: solid;
            text-decoration-thickness: 1px;
            text-underline-offset: 3px;
            display: inline;
            min-width: 80px;
            padding: 0 5px;
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
        
        /* 隐藏答案时的样式 */
        .hide-answers .question-answer {
            display: none !important;
        }
        
        /* 隐藏答案时，移除正确选项的高亮样式，但保留选项本身 */
        .hide-answers .option-correct {
            background-color: transparent !important;
            border: 1px solid #ddd !important;
            font-weight: normal !important;
        }
        
        /* 控制按钮样式 */
        .control-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .control-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .toggle-answer-btn {
            background: #ffc107;
            color: #333;
        }
        
        .toggle-answer-btn:hover {
            background: #ffca2c;
        }
        
        .toggle-answer-btn.hiding {
            background: #28a745;
            color: white;
        }
        
        @media print {
            .control-panel {
                display: none !important;
            }
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
    
    <!-- 控制面板 -->
    <div class="control-panel no-print">
        <button id="toggleAnswerBtn" class="control-btn toggle-answer-btn" onclick="toggleAnswers()">
            🙈 隐藏答案（打印用）
        </button>
    </div>
    
    <div id="exam-content">
        <!-- 试卷内容将在这里插入 -->
    </div>
    
    <div class="export-info no-print">
        <p><strong>本试卷由英语试卷提取器自动生成</strong></p>
        <p>支持浏览器打印 | 建议使用Chrome浏览器</p>
        <p>打印设置：选择"更多设置" → 取消勾选"页眉和页脚" → 勾选"背景图形"</p>
        <p><strong>💡 提示：</strong>点击右上角按钮可以隐藏答案，方便打印给学生</p>
    </div>
    
    <script>
        function toggleAnswers() {
            const body = document.body;
            const btn = document.getElementById('toggleAnswerBtn');
            
            if (body.classList.contains('hide-answers')) {
                // 显示答案
                body.classList.remove('hide-answers');
                btn.textContent = '🙈 隐藏答案（打印用）';
                btn.classList.remove('hiding');
            } else {
                // 隐藏答案
                body.classList.add('hide-answers');
                btn.textContent = '👁️ 显示答案（查看用）';
                btn.classList.add('hiding');
            }
        }
    </script>
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
          
          // 添加选词填空的选项框
          if (question.wordSelectionOptions) {
            const optionsBox = doc.createElement('div');
            optionsBox.className = 'word-selection-box';
            optionsBox.textContent = question.wordSelectionOptions;
            questionDiv.appendChild(optionsBox);
          }
          
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
    
    // 识别题型
    const isCloze = sectionType && sectionType.includes('完形填空');
    const isWordSelection = sectionType && sectionType.includes('选词填空');
    const isInitialLetter = sectionType && sectionType.includes('首字母');
    const isReading = sectionType && sectionType.includes('阅读');
    
    question.isCloze = isCloze;
    question.isWordSelection = isWordSelection;
    question.isInitialLetter = isInitialLetter;
    question.isReading = isReading;
    
    console.log(`处理题型：${sectionType}`);
    
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
    
    // 提取答案（所有题型都需要）
    const answerElements = clone.querySelectorAll('.sanwser');
    if (answerElements.length > 0) {
      // 收集所有答案
      const answers = Array.from(answerElements).map(el => el.textContent.trim()).filter(a => a);
      
      if (isWordSelection || isInitialLetter) {
        // 选词填空和首字母填空：答案是每个空的答案，用逗号分隔
        question.answer = answers.join('、');
      } else if (isCloze) {
        // 完形填空：答案是选项字母，用空格分隔
        question.answer = answers.join(' ');
      } else if (isReading) {
        // 阅读理解：答案可能是字母或完整答案
        question.answer = answers.join(' ');
      } else {
        // 其他题型
        question.answer = answers[0] || '';
      }
    }
    
    if (isCloze) {
      // ===== 完形填空处理 =====
      console.log('处理完形填空题目');
      
      // 先提取选项表格（在移除之前）
      const optionsTable = clone.querySelector('table.composition2');
      if (optionsTable) {
        const tableClone = optionsTable.cloneNode(true);
        question.clozeOptionsHTML = `<table class="cloze-options-table">${tableClone.innerHTML}</table>`;
        optionsTable.remove();
      }
      
      // 移除不需要的元素
      clone.querySelectorAll('.quizPutTag, .sanwser').forEach(el => el.remove());
      
      // 获取HTML内容
      let htmlContent = clone.innerHTML;
      
      // 清理注释
      htmlContent = htmlContent.replace(/<!--.*?-->/g, '');
      
      // 处理题号标记（16）（17）等 - 添加下划线
      htmlContent = htmlContent.replace(/（(\d+)）/g, '<span class="cloze-blank">（$1）________</span>');
      
      // 处理段落：将<br>转换为<p>标签
      const paragraphs = htmlContent.split('<br>').filter(p => p.trim());
      const formattedContent = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
      
      question.contentHTML = `<div class="cloze-passage">${formattedContent}</div>`;
      
    } else if (isWordSelection) {
      // ===== 选词填空处理 =====
      console.log('处理选词填空题目');
      
      // 先提取选项表格（在移除之前）
      const optionsTable = clone.querySelector('table.composition2');
      if (optionsTable) {
        const optionText = optionsTable.textContent.trim();
        question.wordSelectionOptions = optionText;
        optionsTable.remove();
      }
      
      // 移除不需要的元素
      clone.querySelectorAll('.quizPutTag, .sanwser, table').forEach(el => el.remove());
      
      // 获取HTML内容
      let htmlContent = clone.innerHTML;
      
      // 清理注释
      htmlContent = htmlContent.replace(/<!--.*?-->/g, '');
      
      // 处理题号标记（28）（29）等 - 添加下划线
      htmlContent = htmlContent.replace(/（(\d+)）/g, '<span class="cloze-blank">（$1）________</span>');
      
      // 保留<br>标签
      htmlContent = htmlContent.replace(/<br>/g, '</p><p>');
      
      question.contentHTML = `<div class="reading-content"><p>${htmlContent}</p></div>`;
      
    } else if (isInitialLetter) {
      // ===== 首字母填空处理 =====
      console.log('处理首字母填空题目');
      
      // 移除不需要的元素
      clone.querySelectorAll('.quizPutTag, .sanwser, table').forEach(el => el.remove());
      
      // 获取HTML内容
      let htmlContent = clone.innerHTML;
      
      // 清理注释
      htmlContent = htmlContent.replace(/<!--.*?-->/g, '');
      
      // 处理首字母填空：（36）p  → （36）p________
      htmlContent = htmlContent.replace(/（(\d+)）\s*([a-zA-Z])\s+/g, '<span class="initial-letter-blank">（$1）$2________</span> ');
      
      // 保留<br>标签
      htmlContent = htmlContent.replace(/<br>/g, '</p><p>');
      
      question.contentHTML = `<div class="reading-content"><p>${htmlContent}</p></div>`;
      
    } else if (isReading) {
      // ===== 阅读理解处理 =====
      console.log('处理阅读理解题目');
      
      // 移除选项表格
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
        const text = el.textContent;
        el.outerHTML = `<span class="answer-blank">${text}</span>`;
      });
      
      question.contentHTML = `<div class="reading-content"><p>${clone.innerHTML}</p></div>`;
      
    } else {
      // ===== 普通题目处理（单选题等）=====
      
      // 移除选项表格
      clone.querySelectorAll('table').forEach(table => table.remove());
      
      // 移除答案
      clone.querySelectorAll('.sanwser, .quizPutTag').forEach(el => el.remove());
      
      // 处理下划线
      const underlines = clone.querySelectorAll('.mathjye-underline, bdo[class*="underline"]');
      underlines.forEach(el => {
        el.outerHTML = '<span class="answer-blank">________</span>';
      });
      
      // 获取纯文本
      let content = clone.textContent || clone.innerText || '';
      content = content.replace(/\s+/g, ' ').trim();
      
      question.content = content;
    }
    
    // 提取选项（非完形填空、非选词填空、非首字母填空）
    if (!isCloze && !isWordSelection && !isInitialLetter) {
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
        
        // 如果没有通过.sanwser提取到答案，尝试从正确选项中提取
        if (!question.answer && question.options.length > 0) {
          const correctOption = question.options.find(opt => opt.isCorrect);
          if (correctOption) {
            // 提取选项字母（A、B、C、D）
            const match = correctOption.text.match(/^([A-Z])[．.]/);
            if (match) {
              question.answer = match[1];
            }
          }
        }
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

// 生成答案页HTML
function extractAnswerSheetAsHTML() {
  try {
    const titleElement = document.querySelector('title');
    const examTitle = titleElement ? titleElement.textContent.trim() : '英语试卷';
    
    const answerTemplate = `
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examTitle} - 答案页</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
        }
        
        body {
            font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            background: white;
            color: #333;
        }
        
        .answer-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
        }
        
        .answer-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #0066cc;
        }
        
        .answer-subtitle {
            font-size: 18px;
            color: #666;
        }
        
        .answer-info {
            font-size: 14px;
            color: #999;
            margin-top: 5px;
        }
        
        .answer-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #fff;
            background: #0066cc;
            padding: 12px 20px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .answer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 15px;
        }
        
        .answer-item {
            padding: 10px 15px;
            background: #f8f9fa;
            border-left: 4px solid #28a745;
            border-radius: 3px;
            font-size: 15px;
        }
        
        .answer-number {
            font-weight: bold;
            color: #0066cc;
            margin-right: 8px;
        }
        
        .answer-value {
            color: #28a745;
            font-weight: bold;
        }
        
        .long-answer {
            grid-column: 1 / -1;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
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
        }
        
        @page {
            margin: 1.5cm;
        }
    </style>
</head>
<body>
    <div class="answer-header">
        <div class="answer-title">参考答案</div>
        <div class="answer-subtitle">${examTitle}</div>
        <div class="answer-info">生成时间：${new Date().toLocaleString('zh-CN')}</div>
    </div>
    
    <div id="answer-content">
        <!-- 答案内容将在这里插入 -->
    </div>
    
    <div class="export-info no-print">
        <p><strong>本答案页由英语试卷提取器自动生成</strong></p>
        <p>建议与试卷分开打印，方便批改使用</p>
    </div>
</body>
</html>`;

    const extractedContent = extractQuestionsBySection();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(answerTemplate, 'text/html');
    const contentContainer = doc.getElementById('answer-content');
    
    if (extractedContent.sections.length > 0) {
      extractedContent.sections.forEach(section => {
        const sectionDiv = doc.createElement('div');
        sectionDiv.className = 'answer-section';
        
        if (section.type && section.type.trim() !== '') {
          const titleDiv = doc.createElement('div');
          titleDiv.className = 'section-title';
          titleDiv.textContent = section.type;
          sectionDiv.appendChild(titleDiv);
        }
        
        const gridDiv = doc.createElement('div');
        gridDiv.className = 'answer-grid';
        
        section.questions.forEach((question, index) => {
          if (question.answer && question.answer.trim() !== '') {
            const answerItem = doc.createElement('div');
            
            // 判断是否是长答案（超过20个字符）
            const isLongAnswer = question.answer.length > 20;
            answerItem.className = isLongAnswer ? 'answer-item long-answer' : 'answer-item';
            
            const numberSpan = doc.createElement('span');
            numberSpan.className = 'answer-number';
            numberSpan.textContent = question.number || `${index + 1}.`;
            
            const valueSpan = doc.createElement('span');
            valueSpan.className = 'answer-value';
            valueSpan.textContent = question.answer;
            
            answerItem.appendChild(numberSpan);
            answerItem.appendChild(valueSpan);
            
            gridDiv.appendChild(answerItem);
          }
        });
        
        sectionDiv.appendChild(gridDiv);
        contentContainer.appendChild(sectionDiv);
      });
    }
    
    return doc.documentElement.outerHTML;
    
  } catch (error) {
    console.error('生成答案页时出错:', error);
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
  } else if (request.action === "extractAnswerSheet") {
    try {
      const answerHTML = extractAnswerSheetAsHTML();
      sendResponse({ 
        success: true, 
        data: answerHTML,
        title: document.title
      });
    } catch (error) {
      console.error('生成答案页时出错:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  return true;
});