function dtRowDelete(event) {
    event.preventDefault();
    $(event.target).closest('a').blur();

    let row = $(event.target).closest('tr');
    let id  = row.attr('id').replace(/row_(.+)/, "$1");
    let api = $(event.delegateTarget).DataTable();

    if (confirm(api.i18n('buttons.rowDeleteConfirm', 'Are you sure you wont to delete this item?'))){
        $.ajax({
            url: window.location.href+'/'+id,
            type: "DELETE",
            dataType: "json",
        }).done(function(data, textStatus, jqXHR) {
            if(data.status === 1){
                api.row(row).remove().draw();

                appendAlert('success', api.i18n('buttons.itemDeleted', 'Item deleted'));
            }else{
                data.errors.forEach(function(error, i, arr) {
                    appendAlert('error', error.message);
                });
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            appendAlert('error', textStatus);
        });
    }
}

function dtRowsDelete(event, dt, node, conf) {
    let ids            = [];
    let rows           = dt.rows('.selected');
    const selected_ids = rows.ids();

    for (let index = 0; index < selected_ids.length; ++index) {
        ids.push(selected_ids[index].replace(/row_(.+)/, "$1"));
    }

    if(ids.length > 0){
        if(confirm(dt.i18n('buttons.rowsDeleteConfirm', 'Are you sure you wont to delete selected items?'))){
            $.ajax({
                url: window.location.href+"/"+ids.join(','),
                type: "DELETE",
                dataType: "json",
            }).done(function(data, textStatus, jqXHR) {
                if(data.status === 1){
                    rows.remove().draw();

                    appendAlert('success', dt.i18n('buttons.itemsDeleted', 'Items deleted'));
                }else{
                    data.errors.forEach(function(error, i, arr) {
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
    const id = $(event.target).closest('tr').attr('id').replace(/row_(.+)/, "$1");

    $.ajax({
        url: window.location.href+'/'+id+'/move',
        type: "PUT",
        dataType: "json",
        data: {direction: event.data.direction}
    }).done(function(data, textStatus, jqXHR) {
        if(data.status === 1){
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

jQuery.fn.dataTable.render.dataTableActionBtns = function (  ) {
    return function ( data, type, row, meta ) {
        if(type !== 'display') {
            return data;
        }

        if(meta.settings.bDrawing === false){
            return data;
        }

        const isFirst = meta.row === 0;
        const isLast  = meta.row === meta.settings.json.recordsTotal - 1;
        const id      = data['pk'];
        const url     = window.location.href + '/' + id;
        const api     = new $.fn.dataTable.Api(meta.settings);
        let newData = '';

        for (let i = 0; i < data['actions'].length; ++i) {
            switch (data['actions'][i]){
                case 'create'    : break;
                case 'update'    : newData += '<a href="'+url+'"     class="btn btn-link text-decoration-none text-primary dtRowUpdate" title="'+api.i18n('buttons.edit', 'Edit')+'"><i class="far fa-edit"></i></a>';           break;
                case 'delete'    : newData += '<button               class="btn btn-link text-decoration-none text-danger  dtRowDelete" title="'+api.i18n('buttons.delete', 'Delete')+'"><i class="fas fa-trash"></i></button>'; break;
                case 'addChild'  : newData += '<a href="'+url+'/new" class="btn btn-link text-decoration-none text-success dtRowChild"  title="'+api.i18n('buttons.addChild', 'Add child')+'"><i class="fas fa-plus"></i></a>';  break;

                case 'move'      :
                    const mvUpClass = (meta.row === 0 || isFirst === true)                               ? 'dtRowMoveUp disabled' : 'dtRowMoveUp';
                    const mvDnClass = (meta.row === meta.settings._iRecordsTotal - 1 || isLast === true) ? 'dtRowMoveDn disabled' : 'dtRowMoveDn';

                    newData += '<button class="btn btn-link text-decoration-none '+mvUpClass+'" title="'+api.i18n('buttons.moveUp', 'Move up')+'"><i class="fas fa-arrow-up"></i></button>';
                    newData += '<button class="btn btn-link text-decoration-none '+mvDnClass+'" title="'+api.i18n('buttons.moveDn', 'Move down')+'"><i class="fas fa-arrow-down"></i></button>';

                    break;
            }
        }

        return newData;
    };
};

jQuery.fn.dataTable.ext.buttons.create = {
    text: '<i class="fas fa-plus"></i>',
    titleAttr: function ( dt ) {
        return dt.i18n( 'buttons.create', 'Add new item');
    },
    className: 'text-success dtCreateBtn',
    action: function ( e, dt, node, config ) {
        window.location = window.location.href+'/new';
    }
};

jQuery.fn.dataTable.ext.buttons.delete = {
    text: '<i class="fas fa-trash"></i>',
    titleAttr: function ( dt ) {
        return dt.i18n( 'buttons.deleteItems', 'Delete items');
    },
    className: 'text-danger dtDeleteBtn',
    action: function ( e, dt, node, conf ) {
        dtRowsDelete(e, dt, node, conf);
    },
    enabled: false,
    init: function ( dt , node, config ) {
        let that = this;

        dt.on( 'draw.dt.DT select.dt.DT deselect.dt.DT', function () {
            if ( that.select.items() === 'row' ) {
                that.enable(that.rows({selected: true}).count() !== 0);
            }
        });
    }
};

(function(window, document, $, undefined) {

    $.fn.dataTable.dataTableActionBtns = function ( inst ) {
        let api = new $.fn.dataTable.Api( inst );

        const container = new $.fn.dataTable.Buttons(api, {
            //    name: 'main',
            buttons: api.init().dataTableActionBtns || ['create', 'delete'],
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
            const btn = new $.fn.dataTable.dataTableActionBtns(settings);
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
