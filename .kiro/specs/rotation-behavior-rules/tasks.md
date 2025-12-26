# Implementation Plan

- [x] 1. 实现 ActiveSelection 旋转禁止




  - [ ] 1.1 在 selection:created 事件中禁用 ActiveSelection 旋转
    - 检测是否为多选（selection.length > 1）
    - 设置 hasRotatingPoint: false
    - 设置 lockRotation: true

    - 调用 setControlsVisibility({ mtr: false })
    - _Requirements: 3.1, 3.4, 3.5_
  - [x] 1.2 在 selection:updated 事件中禁用 ActiveSelection 旋转


    - 检测 activeObject.type === 'activeSelection'
    - 应用相同的禁用逻辑
    - _Requirements: 3.1, 3.4, 3.5_



  - [-] 1.3 实现旋转尝试拦截

    - 监听 object:rotating 事件
    - 如果是 ActiveSelection，恢复角度为 0
    - 显示提示信息
    - _Requirements: 3.2, 3.3_



- [ ] 2. 实现建组功能
  - [x] 2.1 创建 groupSelected 函数

    - 获取当前 ActiveSelection

    - 验证选中对象数量 >= 2
    - 创建 fabric.Group 包含所有选中对象
    - 从画布移除原对象
    - 添加 Group 到画布并选中
    - 保存状态到历史记录
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 2.2 添加 Ctrl+G 快捷键
    - 在 keydown 事件中监听 Ctrl+G
    - 调用 groupSelected 函数



    - _Requirements: 6.1_


- [ ] 3. 实现解组功能
  - [x] 3.1 创建 ungroupSelected 函数


    - 获取当前选中的 Group

    - 使用 _restoreObjectsState() 恢复子对象状态
    - 从画布移除 Group
    - 将子对象添加回画布
    - 保存状态到历史记录
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ] 3.2 添加 Ctrl+Shift+G 快捷键
    - 在 keydown 事件中监听 Ctrl+Shift+G
    - 调用 ungroupSelected 函数
    - _Requirements: 4.1_

- [ ] 4. 添加多语言支持
  - [ ] 4.1 更新语言文件
    - 在 en.json 添加英文提示
    - 在 zh-CN.json 添加中文提示
    - 在 ja.json 添加日文提示
    - 在 ko.json 添加韩文提示
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5. 验证功能
  - [ ] 5.1 验证 ActiveSelection 旋转禁止
    - 框选多个对象，确认不显示旋转控制柄
    - 尝试旋转，确认显示提示且不旋转
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 5.2 验证建组/解组功能
    - 选中多个对象，按 Ctrl+G 建组
    - 旋转 Group，确认正常旋转
    - 按 Ctrl+Shift+G 解组
    - 确认子对象位置、角度、缩放与解组前一致
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3_
  - [ ] 5.3 回归测试
    - 单对象旋转正常
    - Group 旋转正常
    - 智能对齐功能正常
    - 撤销/重做功能正常
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_
