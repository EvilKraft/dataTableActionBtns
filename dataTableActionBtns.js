
var rowDeleteConfirm  = i18next.t('Are you sure you wont to delete this item?');
var rowsDeleteConfirm = i18next.t('Are you sure you wont to delete selected items?');
var itemDeleted       = i18next.t('Item deleted');
var itemsDeleted      = i18next.t('Items deleted');

function dtRowUpdate(event) {
    var id = $(event.target).closest('tr').attr('id').replace(/\D/g, '');

    window.location = window.location.href+'/'+id;
}

function dtRowDelete(event) {
    var row = $(event.target).closest('tr');
    var id  = row.attr('id').replace(/\D/g, '');
    var url = window.location.href+'/'+id;

    //console.log($(event.delegateTarget).DataTable().row( $(this).closest('tr') ).data());
    //console.log(tableData.row( '#row_'+rowId ).data());

    if (confirm(rowDeleteConfirm)){
        $.ajax({
            url: url,
            type: "DELETE",
            dataType: "json",
        }).done(function(data, textStatus, jqXHR) {
            if(result.status == 1){
                $(event.delegateTarget).DataTable().row(row).remove().draw();

                appendAlert('success', itemDeleted);
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
        ids.push(selected_ids[index].replace(/\D/g, ''));
    }

    if(ids.length > 0){
        if(confirm(rowsDeleteConfirm)){
            $.ajax({
                url: url+"/"+ids.join(','),
                type: "DELETE",
                dataType: "json",
            }).done(function(data, textStatus, jqXHR) {
                if(result.status == 1){
                    rows.remove().draw();

                    appendAlert('success', itemsDeleted);
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
    var id = $(event.target).closest('tr').attr('id').replace(/\D/g, '');
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
        var api = new $.fn.dataTable.Api( meta.settings );

        var new_data = '';

        for (i = 0; i < actions.length; ++i) {
            switch (actions[i]){
                case 'create' : new_data += ''; break;
                case 'update' : new_data += '<i class="dtRowUpdate fa fa-edit fa-lg"   title="'+api.i18n('buttons.edit', 'Edit')+'"></i>';break;
                case 'delete' : new_data += '<i class="dtRowDelete fa fa-remove fa-lg" title="'+api.i18n('buttons.delete', 'Delete')+'"></i>';break;
                case 'move'   :
                    new_data += '<i class="dtRowMoveUp   fa fa-arrow-up   fa-lg" title="'+api.i18n('buttons.moveUp', 'Move up')+'"></i>';
                    new_data += '<i class="dtRowMoveDown fa fa-arrow-down fa-lg" title="'+api.i18n('buttons.moveDown', 'Move down')+'"></i>';
                    break;
            }
        }

        return new_data;
    };
};

jQuery.fn.dataTable.ext.buttons.create = {
    text: '<i class="fa fa-plus fa-lg"></i>',
    titleAttr: function ( dt ) {
        return dt.i18n( 'buttons.create', 'Add new item');
    },
    className: 'text-green',
    action: function ( e, dt, node, config ) {
        window.location = window.location.href+'/new';
    }
};

jQuery.fn.dataTable.ext.buttons.delete = {
    text: '<i class="fa fa-trash fa-lg"></i>',
    titleAttr: function ( dt ) {
        return dt.i18n( 'buttons.deleteItems', 'Delete items');
    },
    className: 'text-red',
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
    var api = new $.fn.dataTable.Api( settings );

    api.$('.dtRowUpdate').on('click', dtRowUpdate);
    api.$('.dtRowDelete').on('click', dtRowDelete);
    api.$('.dtRowMoveUp').on('click',  {direction: 'up'},   dtRowMove);
    api.$('.dtRowMoveDown').on('click', {direction: 'down'}, dtRowMove);
} );
