import React, { useState } from 'react';
import { Input, Button, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import './App.css';

function App() {
  const [formItems, setFormItems] = useState([{ id: 1, values: {} }]);
  const [totalOutput, setTotalOutput] = useState('');

  // 输出顺序：1, 2, 6, 9, 10, 11, 12, 13, 3, 8, 5, 7, 4
  const outputOrder = [1, 2, 6, 9, 10, 11, 12, 13, 3, 8, 5, 7, 4];

  const handleInputChange = (itemId, index, value) => {
    setFormItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, values: { ...item.values, [index]: value } }
        : item
    ));
  };

  const handleAddFormItem = () => {
    const newId = Math.max(...formItems.map(item => item.id), 0) + 1;
    setFormItems(prev => [...prev, { id: newId, values: {} }]);
  };

  const handleRemoveFormItem = (itemId) => {
    setFormItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleClearAllFormItems = () => {
    setFormItems([]);
  };

  const handleGenerateTotal = () => {
    const allOutputs = formItems.map(item => {
      const orderedValues = outputOrder.map(index => item.values[index] || '');
      return orderedValues.join('，');
    });
    setTotalOutput(allOutputs.join('|'));
  };

  const handleParseTotal = () => {
    if (!totalOutput.trim()) {
      return;
    }

    // 按照 "|" 或 "｜"（中文竖线）分隔得到多个表单项的字符串
    // 先统一替换中文竖线为英文竖线
    const normalizedOutput = totalOutput.replace(/｜/g, '|');
    const itemStrings = normalizedOutput.split('|').map(s => s.trim()).filter(s => s);
    
    // 解析每个字符串为表单项
    const newFormItems = itemStrings.map((itemString, index) => {
      // 按照 "," 或 "，"（中文逗号）分隔得到值数组，保留空值
      // 先统一替换中文逗号为英文逗号
      const normalizedString = itemString.replace(/，/g, ',');
      // 注意：split(',') 会保留空字符串，所以 'a,,b' 会得到 ['a', '', 'b']
      const values = normalizedString.split(',');
      
      // 确保值数组长度足够（至少要有 outputOrder.length 个元素）
      // 如果不够，用空字符串填充
      while (values.length < outputOrder.length) {
        values.push('');
      }
      
      // 只取前 outputOrder.length 个值，防止有多余的值
      const trimmedValues = values.slice(0, outputOrder.length);
      
      // 按照输出顺序反向映射回输入框索引
      const itemValues = {};
      outputOrder.forEach((inputIndex, outputIndex) => {
        // 使用 !== undefined 来检查，因为空字符串也是有效值
        const rawValue = trimmedValues[outputIndex] !== undefined ? trimmedValues[outputIndex] : '';
        // trim 处理空格，但保留空字符串
        const value = typeof rawValue === 'string' ? rawValue.trim() : '';
        itemValues[inputIndex] = value;
      });
      
      // 直接使用索引+1作为ID，因为每次解析都是替换所有表单项
      return {
        id: index + 1,
        values: itemValues
      };
    });

    // 如果解析出表单项，则直接替换现有的表单项（不是追加）
    if (newFormItems.length > 0) {
      setFormItems(newFormItems);
    }
  };

  const renderFormItem = (item) => {
    const parts = [
      { text: '第 ', input: 1, after: ' 回合,场上存活人数为 ' },
      { text: '', input: 2, after: ' ,我方场上有 ' },
      { text: '', input: 3, after: ' 人,已开人口为 ' },
      { text: '', input: 4, after: ' 人,血量为 ' },
      { text: '', input: 5, after: ' , ' },
      { text: '', input: 6, after: ' 满级, ' },
      { text: '', input: 7, after: ' 已上场且未满级,圣物为 ' },
      { text: '', input: 8, after: ' ,对面有 ' },
      { text: '', input: 9, after: ' ,则将 ' },
      { text: '', input: 10, after: ' 的优先级改为 ' },
      { text: '', input: 11, after: ' ,如果上不去则卖掉 ' },
      { text: '', input: 12, after: ' ,并将其优先级改为 ' },
      { text: '', input: 13, after: '' }
    ];

    return (
      <div key={item.id} className="form-item">
        <div className="form-item-header">
          <span className="form-item-title">表单项 {item.id}</span>
          <Button 
            type="text" 
            danger 
            icon={<CloseOutlined />} 
            onClick={() => handleRemoveFormItem(item.id)}
            className="remove-btn"
          />
        </div>
        <div className="input-section">
          {parts.map((part, idx) => (
            <span key={idx}>
              {part.text}
              <Input
                style={{ width: 80, margin: '0 4px' }}
                value={item.values[part.input] || ''}
                onChange={(e) => handleInputChange(item.id, part.input, e.target.value)}
              />
              {part.after}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="container">
        {/* 顶部输出区域 */}
        <div className="total-output-section">
          <div className="output-label">总输出内容:</div>
          <TextArea
            className="total-output-content"
            value={totalOutput}
            onChange={(e) => setTotalOutput(e.target.value)}
            placeholder="请输入或粘贴总内容，用 | 分隔多个表单项，用 ， 分隔每个表单项的值"
            rows={4}
          />
          <Space style={{ marginTop: 15 }}>
            <Button type="primary" onClick={handleGenerateTotal}>
              生成总内容
            </Button>
            <Button type="primary" onClick={handleParseTotal}>
              解析总内容
            </Button>
            <Button onClick={() => setTotalOutput('')}>
              清空总内容
            </Button>
          </Space>
        </div>

        {/* 表单项列表 */}
        <div className="form-section">
          <div style={{ marginBottom: 20 }}>
            <Space>
              <Button type="default" onClick={handleAddFormItem}>
                添加表单项
              </Button>
              <Button danger onClick={handleClearAllFormItems}>
                清除所有表单项
              </Button>
            </Space>
          </div>
          
          {formItems.map(item => renderFormItem(item))}
        </div>
      </div>
    </div>
  );
}

export default App;
