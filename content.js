// 试卷内容提取函数 - 改进版
function extractExamContent() {
  // 提取试卷标题 - 多种方式尝试
  let title = '英语试卷';
  
  // 方式1: 从页面标题提取
  const titleElement = document.querySelector('title');
  if (titleElement && titleElement.textContent.trim()) {
    title = titleElement.textContent.trim();
  }
  
  // 方式2: 查找页面中的试卷标题
  const h1Elements = document.querySelectorAll('h1, .paper-title, .exam-title');
  for (let h1 of h1Elements) {
    if (h1.textContent.trim() && h1.textContent.length < 100) {
      title = h1.textContent.trim();
      break;
    }
  }
  
  console.log('提取到的标题:', title);
  
  // 提取所有题目 - 改进版选择器
  const examSections = [];
  
  // 首先尝试找到所有题目容器
  const allQuestions = document.querySelectorAll('li.QUES_LI, .question-item, .ques-item');
  console.log('找到题目数量:', allQuestions.length);
  
  if (allQuestions.length > 0) {
    const section = {
      type: "试卷题目",
      questions: []
    };
    
    allQuestions.forEach((questionEl, index) => {
      console.log(`正在处理第${index + 1}题`);
      const questionData = extractQuestionData(questionEl);
      if (questionData && questionData.content) {
        section.questions.push(questionData);
        console.log(`成功提取第${index + 1}题:`, questionData.number);
      }
    });
    
    if (section.questions.length > 0) {
      examSections.push(section);
    }
  }
  
  // 如果上面的方法没有找到题目，尝试其他方式
  if (examSections.length === 0) {
    console.log('尝试备用提取方法...');
    
    // 查找包含题目的其他容器
    const alternativeSelectors = [
      'fieldset[class*="ques"]',
      '.question',
      '.exam-question',
      '[id*="question"]',
      '.pt1'  // 根据试卷HTML结构添加
    ];
    
    for (let selector of alternativeSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`尝试选择器 ${selector}, 找到 ${elements.length} 个元素`);
      
      if (elements.length > 0) {
        const section = {
          type: "试卷题目",
          questions: []
        };
        
        elements.forEach((el, index) => {
          const questionData = extractQuestionData(el);
          if (questionData && questionData.content) {
            section.questions.push(questionData);
          }
        });
        
        if (section.questions.length > 0) {
          examSections.push(section);
          break;
        }
      }
    }
  }
  
  console.log('最终提取结果:', {
    title: title,
    sectionsCount: examSections.length,
    totalQuestions: examSections.reduce((sum, section) => sum + section.questions.length, 0)
  });
  
  return {
    title: title,
    sections: examSections
  };
}

// 提取单个题目的数据 - 改进版
function extractQuestionData(questionElement) {
  try {
    const questionData = {};
    
    // 提取题号 - 多种方式尝试
    let numberEl = questionElement.querySelector('.qseq, .question-number, .num');
    if (!numberEl) {
      // 尝试从内容中提取题号
      const textContent = questionElement.textContent || '';
      const numberMatch = textContent.match(/^(\d+[\.．、])/);
      if (numberMatch) {
        questionData.number = numberMatch[1];
      }
    } else {
      questionData.number = numberEl.textContent.trim();
    }
    
    // 提取题目内容 - 改进版本
    let contentEl = questionElement.querySelector('.pt1, .question-content, .content');
    if (!contentEl) {
      // 如果没找到特定的内容元素，使用整个元素但排除选项表格
      contentEl = questionElement;
    }
    
    if (contentEl) {
      // 克隆元素避免修改原页面
      const clone = contentEl.cloneNode(true);
      
      // 移除不需要的元素
      const removeSelectors = [
        '.qseq', '.sanwser', '.quizPutTag', 'table', 
        '.question-number', '.answer', '.options',
        '.fieldtip', '.btn', 'script', 'style'
      ];
      
      removeSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      });
      
      // 获取纯文本内容
      let content = clone.textContent || clone.innerText || '';
      
      // 清理内容
      content = content
        .replace(/\s+/g, ' ')  // 多个空白字符替换为单个空格
        .replace(/^\d+[\.．、]\s*/, '')  // 移除开头的题号
        .replace(/（\s*）/g, '（　　）')  // 标准化填空符号
        .trim();
      
      // 处理下划线空白（常见的填空题标记）
      content = content.replace(/_{3,}/g, '________');
      
      questionData.content = content;
    }
    
    // 提取选项 - 改进版本
    const optionsTable = questionElement.querySelector('table.ques, .options, .choices');
    if (optionsTable) {
      questionData.options = [];
      const optionElements = optionsTable.querySelectorAll('.selectoption, .option, .choice');
      
      optionElements.forEach(optionEl => {
        // 检查是否是正确答案 - 多种标记方式
        const isCorrect = !!(
          optionEl.querySelector('.s.sh') ||
          optionEl.querySelector('.correct') ||
          optionEl.classList.contains('correct') ||
          optionEl.classList.contains('selected') ||
          optionEl.style.fontWeight === 'bold'
        );
        
        const text = optionEl.textContent.trim();
        if (text && text.length > 0) {
          questionData.options.push({
            text: text,
            isCorrect: isCorrect
          });
        }
      });
    }
    
    // 如果没有在表格中找到选项，尝试其他方式
    if (!questionData.options || questionData.options.length === 0) {
      const optionElements = questionElement.querySelectorAll('.selectoption, .option, .choice');
      if (optionElements.length > 0) {
        questionData.options = [];
        optionElements.forEach(optionEl => {
          const isCorrect = !!(
            optionEl.querySelector('.s.sh') ||
            optionEl.classList.contains('correct')
          );
          const text = optionEl.textContent.trim();
          if (text) {
            questionData.options.push({
              text: text,
              isCorrect: isCorrect
            });
          }
        });
      }
    }
    
    // 提取答案
    const answerEl = questionElement.querySelector('.sanwser, .answer, .solution');
    if (answerEl) {
      questionData.answer = answerEl.textContent.trim();
    }
    
    // 验证题目数据的有效性
    if (!questionData.content || questionData.content.length < 3) {
      console.log('题目内容太短，跳过:', questionData);
      return null;
    }
    
    return questionData;
    
  } catch (error) {
    console.error('提取单个题目数据时出错:', error);
    return null;
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request.action);
  
  if (request.action === "extractContent") {
    try {
      const examData = extractExamContent();
      console.log('提取完成，发送响应:', examData);
      sendResponse({ 
        data: examData,
        success: true 
      });
    } catch (error) {
      console.error('提取内容时出错:', error);
      sendResponse({ 
        data: null,
        success: false,
        error: error.message 
      });
    }
  }
  
  return true; // 保持消息通道开放
});