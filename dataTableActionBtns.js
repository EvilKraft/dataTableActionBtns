var style = document.createElement('style');
style.innerHTML = `
  .dtRowCreate::before {font-family: "Font Awesome 5 Free"; font-size: 1.33em; font-weight: 900; content: "\\f067";}
  .dtRowUpdate::before {font-family: "Font Awesome 5 Free"; font-size: 1.33em; font-weight: 400; content: "\\f044";}
  .dtRowDelete::before {font-family: "Font Awesome 5 Free"; font-size: 1.33em; font-weight: 900; content: "\\f1f8";}
  .dtRowChild::before  {font-family: "Font Awesome 5 Free"; font-size: 1.33em; font-weight: 900; content: "\\f067";}
  .dtRowMoveUp::before {font-family: "Font Awesome 5 Free"; font-size: 1.33em; font-weight: 900; content: "\\f062";}
  .dtRowMoveDn::before {font-family: "Font Awesome 5 Free"; font-size: 1.33em; font-weight: 900; content: "\\f063";}
`;
document.head.appendChild(style);


function dtRowDelete(event) {
    event.preventDefault();
    $(event.target).closest('a').blur();


    var row = $(event.target).closest('tr');
    var id  = row.attr('id').replace(/row_(.+)/, "$1");
    var url = window.location.href+'/'+id;
    var api = $(event.delegateTarget).DataTable();

    if (confirm(api.i18n('buttons.rowDeleteConfirm', 'Are you sure you wont to delete this item?'))){
        $.ajax({
            url: url,
            type: "DELETE",
            dataType: "json",
        }).done(function(data, textStatus, jqXHR) {
            if(data.status == 1){
                api.row(row).remove().draw();

                appendAlert('success', api.i18n('buttons.itemDeleted', 'Item deleted'));
            }else{
                result.errors.forEach(function(error, i, arr) {
                    appendAlert('error', error.message);
                });
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            appendAlert('error', textStatus);
        });
    }
}

function dtRowsDelete(event, dt, node, conf) {
    var ids = [];
    var url = window.location.href;
    var rows         = dt.rows('.selected');
    var selected_ids = rows.ids();

    for (index = 0; index < selected_ids.length; ++index) {
        ids.push(selected_ids[index].replace(/row_(.+)/, "$1"));
    }

    if(ids.length > 0){
        if(confirm(dt.i18n('buttons.rowsDeleteConfirm', 'Are you sure you wont to delete selected items?'))){
            $.ajax({
                url: url+"/"+ids.join(','),
                type: "DELETE",
                dataType: "json",
            }).done(function(data, textStatus, jqXHR) {
                if(data.status == 1){
                    rows.remove().draw();

                    appendAlert('success', dt.i18n('buttons.itemsDeleted', 'Items deleted'));
                }else{
                    result.errors.forEach(function(error, i, arr) {
                        appendAlert('error', error.message);
                    });
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                appendAlert('error', textStatus);
            });
        }
    }
}

function dtRowMove(event){
    var id = $(event.target).closest('tr').attr('id').replace(/row_(.+)/, "$1");
    var url = window.location.href+'/'+id+'/move';

    $.ajax({
        url: url,
        type: "PUT",
        dataType: "json",
        data: {direction: event.data.direction}
    }).done(function(data, textStatus, jqXHR) {
        if(data.status == 1){
            $(event.delegateTarget).DataTable().draw();
        }else{
            data.errors.forEach(function(error, i, arr) {
                appendAlert('error', error.message);
            });
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        appendAlert('error', textStatus);
    });
}

jQuery.fn.dataTable.render.dataTableActionBtns = function ( actions ) {
    return function ( data, type, row, meta ) {
        if (type !== 'display') {
            return data;
        }

        var id = data['DT_RowId'].replace(/row_(.+)/, "$1");
        var url = window.location.href+'/'+id;

        var api = new $.fn.dataTable.Api( meta.settings );
        var newData = '';

        for (i = 0; i < actions.length; ++i) {
            switch (actions[i]){
                case 'create'    : break;
                case 'update'    : newData += '<a href="'+url+'"     class="btn btn-link text-primary dtRowUpdate" title="'+api.i18n('buttons.edit', 'Edit')+'"></a>';          break;
                case 'delete'    : newData += '<button               class="btn btn-link text-danger  dtRowDelete" title="'+api.i18n('buttons.delete', 'Delete')+'"></button>'; break;
                case 'addChild'  : newData += '<a href="'+url+'/new" class="btn btn-link text-success dtRowChild"  title="'+api.i18n('buttons.addChild', 'Add child')+'"></a>'; break;

                case 'move'      :
                    var mvUpClass = (meta.row == 0 || data.isFirst == 1)                               ? 'dtRowMoveUp disabled' : 'dtRowMoveUp';
                    var mvDnClass = (meta.row == meta.settings._iRecordsTotal - 1 || data.isLast == 1) ? 'dtRowMoveDn disabled' : 'dtRowMoveDn';

                    newData += '<button class="btn btn-link '+mvUpClass+'" title="'+api.i18n('buttons.moveUp', 'Move up')+'"></button>';
                    newData += '<button class="btn btn-link '+mvDnClass+'" title="'+api.i18n('buttons.moveDn', 'Move down')+'"></button>';

                    break;
            }
        }

        return newData;
    };
};

jQuery.fn.dataTable.ext.buttons.create = {
  //  text: '',
    titleAttr: function ( dt ) {
        return dt.i18n( 'buttons.create', 'Add new item');
    },
    className: 'text-success dtRowCreate',
    action: function ( e, dt, node, config ) {
        window.location = window.location.href+'/new';
    }
};

jQuery.fn.dataTable.ext.buttons.delete = {
//    text: '',
    titleAttr: function ( dt ) {
        return dt.i18n( 'buttons.deleteItems', 'Delete items');
    },
    className: 'text-danger dtRowDelete',
    action: function ( e, dt, node, conf ) {
        dtRowsDelete(e, dt, node, conf);
    },
    enabled: false,
    init: function ( dt , node, config ) {
        var that = this;

        dt.on( 'draw.dt.DT select.dt.DT deselect.dt.DT', function () {
            if ( that.select.items() === 'row' ) {
                that.enable(
                    that.rows({selected: true}).count() === 0 ? false : true
                );
            }
        });
    }
};

(function(window, document, $, undefined) {

    $.fn.dataTable.dataTableActionBtns = function ( inst ) {
        var api = new $.fn.dataTable.Api( inst );
        var buttons = api.init().dataTableActionBtns || ['create', 'delete'];

        var container = new $.fn.dataTable.Buttons( api, {
            //    name: 'main',
            buttons: buttons,
        }).container();

        // API so the feature wrapper can return the node to insert
        this.container = function () {
            return container;
        };
    };
    $.fn.DataTable.dataTableActionBtns = $.fn.dataTable.dataTableActionBtns;

    // Subscribe the feature plug-in to DataTables, ready for use
    $.fn.dataTable.ext.feature.push( {
        fnInit: function( settings ) {
            var btn = new $.fn.dataTable.dataTableActionBtns( settings );
            return btn.container();
        },
        cFeature: "b"
    } );

})(window, document, jQuery);

$(document).on( 'init.dt', function ( e, settings ) {
    $(e.target).on('click', '.dtRowDelete', dtRowDelete);
    $(e.target).on('click', '.dtRowMoveUp', {direction: 'up'}, dtRowMove);
    $(e.target).on('click', '.dtRowMoveDn', {direction: 'dn'}, dtRowMove);
} );
