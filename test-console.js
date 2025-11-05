// 浏览器控制台测试脚本
// 使用方法：
// 1. 打开试卷页面
// 2. 按F12打开开发者工具
// 3. 复制此脚本到控制台执行
// 4. 会自动下载提取后的HTML文件

(function() {
  console.log('开始提取试卷...');
  
  // 检测下划线元素
  const underlines = document.querySelectorAll('.mathjye-underline, bdo.mathjye-underline');
  console.log('找到下划线元素数量:', underlines.length);
  
  // 检测完形填空
  const clozeSection = Array.from(document.querySelectorAll('h3.ques-type'))
    .find(h3 => h3.textContent.includes('完形填空'));
  console.log('找到完形填空:', clozeSection ? '是' : '否');
  
  if (clozeSection) {
    // 找到完形填空题目
    let nextEl = clozeSection.nextElementSibling;
    while (nextEl && nextEl.tagName !== 'H3') {
      const clozeQuestion = nextEl.querySelector('li.QUES_LI');
      if (clozeQuestion) {
        const pt1 = clozeQuestion.querySelector('.pt1');
        if (pt1) {
          console.log('完形填空内容长度:', pt1.innerHTML.length);
          console.log('完形填空前100字符:', pt1.innerHTML.substring(0, 100));
          
          // 检查嵌入的题号
          const embeddedNumbers = pt1.innerHTML.match(/（\d+）/g);
          console.log('找到嵌入题号:', embeddedNumbers ? embeddedNumbers.length : 0);
        }
        break;
      }
      nextEl = nextEl.nextElementSibling;
    }
  }
  
  // 测试下划线提取
  if (underlines.length > 0) {
    const firstUnderline = underlines[0];
    console.log('第一个下划线的HTML:', firstUnderline.outerHTML);
    console.log('第一个下划线的文本:', firstUnderline.textContent);
  }
  
  // 显示提取建议
  console.log('\n=== 提取建议 ===');
  console.log('1. 下划线需要替换为 <span class="answer-blank">________</span>');
  console.log('2. 完形填空需要保留HTML结构，不能只提取文本');
  console.log('3. 嵌入的题号（16）（17）需要特殊处理');
  
  alert('测试完成！请查看控制台输出');
})();
