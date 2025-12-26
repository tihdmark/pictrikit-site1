# Implementation Plan

- [x] 1. Create ContainerGroup factory and core structure






  - [ ] 1.1 Implement `createContainerGroup()` function
    - Create frameRect with visible border and fill
    - Create empty contentGroup
    - Create clipPath matching container dimensions
    - Apply clipPath to contentGroup

    - Combine into fabric.Group with `isContainer: true`
    - Store internal references (_frameRect, _contentGroup, _clipPath)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_




  - [ ] 1.2 Implement container identification helpers
    - Create `isContainerGroup(obj)` function
    - Create `getContainerContentGroup(container)` function
    - Create `getContainerFrameRect(container)` function
    - _Requirements: 1.5_


- [ ] 2. Implement container detection and content placement
  - [ ] 2.1 Implement `findContainerAtPoint(x, y)` function
    - Iterate through canvas objects
    - Check if point is within container frameRect bounds
    - Return first matching ContainerGroup or null



    - _Requirements: 2.1_

  - [ ] 2.2 Implement `addContentToContainer(content, container)` function
    - Get contentGroup from container

    - Calculate local coordinates for content
    - Add content to contentGroup
    - Set `_parentContainer` reference on content
    - Refresh container and canvas
    - _Requirements: 2.1, 2.2, 2.3, 2.4_


- [ ] 3. Implement image auto-fit functionality
  - [ ] 3.1 Implement `calculateContainScale()` function
    - Calculate width ratio and height ratio
    - Return minimum ratio for contain mode



    - _Requirements: 3.1_

  - [ ] 3.2 Implement `fitImageToContainer()` function
    - Calculate contain scale
    - Apply scale to image

    - Center image within container bounds
    - Ensure clipPath is applied
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.3 Hook image drop event to container detection
    - Intercept image drop on canvas

    - Check if drop point is in container
    - If yes, call fitImageToContainer instead of direct add
    - _Requirements: 2.1, 3.1, 3.2, 3.3_


- [ ] 4. Implement boundary constraint system
  - [ ] 4.1 Implement `getContainerContentBounds()` function
    - Get container dimensions
    - Calculate content area bounds

    - Return {left, top, width, height}
    - _Requirements: 4.1, 4.2, 4.3_




  - [ ] 4.2 Implement `constrainToContainer()` function
    - Get object bounding box
    - Get container content bounds
    - Calculate clamped position if exceeds bounds

    - Apply clamped position to object
    - _Requirements: 4.4, 4.5_

  - [x] 4.3 Hook constraint to object:moving event

    - Check if moving object has _parentContainer
    - If yes, call constrainToContainer
    - _Requirements: 4.1_


  - [ ] 4.4 Hook constraint to object:scaling event
    - Check if scaling object has _parentContainer
    - If yes, call constrainToContainer
    - _Requirements: 4.2_

  - [ ] 4.5 Hook constraint to path:created event
    - Check if brush path is within container



    - If yes, add to container and apply constraint
    - _Requirements: 4.3_

- [x] 5. Implement container transformation handling

  - [ ] 5.1 Ensure container move preserves content
    - Content moves with container automatically (Group behavior)
    - Verify no additional code needed
    - _Requirements: 5.1_


  - [ ] 5.2 Ensure container scale preserves content
    - Content scales with container automatically (Group behavior)



    - Verify uniform scaling works correctly
    - _Requirements: 5.2, 5.4_

  - [x] 5.3 Ensure container rotate preserves content

    - Content rotates with container automatically (Group behavior)
    - Verify rotation works correctly
    - _Requirements: 5.3_





  - [ ] 5.4 Implement `ungroupContainer()` function
    - Remove clipPath from contentGroup
    - Get all objects from contentGroup

    - Convert each object's coordinates to canvas coordinates
    - Add objects directly to canvas
    - Remove ContainerGroup from canvas
    - Verify no position jumping

    - _Requirements: 5.5, 5.6, 5.7_

- [ ] 6. Implement visual feedback
  - [ ] 6.1 Implement `setContainerHighlight()` function
    - Add/remove highlight style on frameRect
    - Use subtle border color change or glow effect
    - _Requirements: 6.1_

  - [ ] 6.2 Hook highlight to drag events
    - On dragover, find container at point and highlight
    - On dragleave/drop, remove highlight
    - _Requirements: 6.1_

  - [ ] 6.3 Implement boundary resistance feedback
    - When constraint is applied, briefly flash border
    - Or show subtle "bump" animation
    - _Requirements: 6.2_

- [ ] 7. Integrate with existing layout templates
  - [ ] 7.1 Update layout template creation to use ContainerGroup
    - Modify existing layout grid creation
    - Replace simple rectangles with ContainerGroups
    - _Requirements: 1.1_

  - [ ] 7.2 Update right-click menu for containers
    - Add "Ungroup Container" option for ContainerGroups
    - Call ungroupContainer() when selected
    - _Requirements: 5.5, 5.6, 5.7_

- [ ] 8. Ensure compatibility with existing features
  - [ ] 8.1 Test and fix group/ungroup compatibility
    - Verify existing group/ungroup still works
    - Ensure ContainerGroup ungroup uses special logic
    - _Requirements: 8.1_

  - [ ] 8.2 Test and fix rotation compatibility
    - Verify rotation works for containers
    - Verify rotation works for content in containers
    - _Requirements: 8.2_

  - [ ] 8.3 Test and fix alignment/distribution compatibility
    - Verify alignment works with containers
    - Verify distribution works with containers
    - _Requirements: 8.3, 8.4_
