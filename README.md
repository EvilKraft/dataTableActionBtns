# dataTableActionBtns

## Installation

1. Add js file:
```
    <script type="text/javascript" src="/js/dataTableActionBtns/dataTableActionBtns.js"></script>
```

2. Add to dataTables config:
```
  $('#myDataTable').DataTable({
    ...
    dataTableActionBtns: ['create', 'update', 'delete'],
    ...
  });
```

## Options
  - create   : 'Create' button
  - update   : 'Update' button
  - delete   : 'Delete' button
  - move     : 'Move up' and 'Move down' buttons
  - addChild : 'Create child' button
