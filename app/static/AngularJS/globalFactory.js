registrationModule.factory('globalFactory', function() {
    return {
        table: function(dataTable, title, displayLength) {
            $('.' + dataTable).DataTable().destroy();
            setTimeout(function() {
                $('.' + dataTable).DataTable({
                    dom: '<"html5buttons"B>lTfgitp',
                    'iDisplayLength': displayLength,
                    buttons: [{
                        extend: 'excel',
                        exportOptions: {
                            columns: ':visible'
                        },
                        title: title
                    }, {
                        extend: 'print',
                        customize: function(win) {
                            $(win.document.body).addClass('white-bg')
                            $(win.document.body).css('font-size', '10px')

                            $(win.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit')
                        }
                    }]
                })
            }, 100)
        },
        filtrosTabla: function(dataTable, title, displayLength) {
            $('#' + dataTable).DataTable().destroy();
            $('#' + dataTable + ' thead th').each(function() {
                var titulo = $(this).text()
                $(this).html(titulo + '<br><input type="text" class="filtro-tabla"/>')
            })
            setTimeout(function() {
                var table = $('#' + dataTable).DataTable({
                    dom: '<"html5buttons"B>lTfgitp',
                    'iDisplayLength': displayLength,

                    buttons: [{
                        extend: 'excel',
                        exportOptions: {
                            columns: ':visible'
                        },
                        title: title
                    }, {
                        extend: 'print',
                        exportOptions: {
                            columns: ':visible'
                        },
                        customize: function(win) {
                            $(win.document.body).addClass('white-bg')
                            $(win.document.body).css('font-size', '10px')

                            $(win.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit')
                        }
                    }]
                })

                table.columns().every(function() {
                    var that = this

                    $('input', this.header()).on('keyup change', function() {
                        if (that.search() !== this.value) {
                            that
                                .search(this.value)
                                .draw()
                        }
                    })
                    $("#selecionS").on('click', function() {
                        $.fn.dataTable.ext.search.push(
                            function(settings, data, dataIndex) {
                                return ($(table.row(dataIndex).node()).hasClass('selected')) ? true : false;
                            }
                        );

                        table.draw();

                        $.fn.dataTable.ext.search.pop();
                    });
                    $("#selecionT").on('click', function() {
                        table.draw();
                    });
                    // $('#selecionT').click(function() {
                    //     // alert(table.rows('.selected').data().length + ' row(s) selected');
                    //     var seleccionados = table.rows('.selected').data();
                    //     var arreglo = table.rows().data();
                    //     var id = '';
                    //     $.each(seleccionados, function(index, value) {
                    //         id = value[0]
                    //         $.each(arreglo, function(index, value) {
                    //             if (id == value[0]) {
                    //                 that
                    //                     .search(value[0])
                    //                     .draw()
                    //             }
                    //         });
                    //     });
                    // });
                })
            }, 100)
        },
        filtrosTablaSelect: function(dataTable, title, displayLength) {
            $('.' + dataTable).DataTable().destroy();
            // $('.' + dataTable + ' thead th').each(function() {
            //     var titulo = $(this).text()
            //     $(this).html(titulo + '<br><span></span>')
            // })
            setTimeout(function() {
                $('.' + dataTable).DataTable({
                    dom: '<"html5buttons"B>lTfgitp',
                    'iDisplayLength': displayLength,
                    buttons: [{
                        extend: 'excel',
                        exportOptions: {
                            columns: ':visible'
                        },
                        title: title
                    }, {
                        extend: 'print',
                        customize: function(win) {
                            $(win.document.body).addClass('white-bg')
                            $(win.document.body).css('font-size', '10px')

                            $(win.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit')
                        }
                    }],
                    initComplete: function() {
                        this.api().columns().every(function() {
                            var column = this;
                            var select = $('<select><option value=""></option></select>')
                                .appendTo($('.filtrosSelect', column.header()).empty())
                                .on('change', function() {
                                    var val = $.fn.dataTable.util.escapeRegex(
                                        $(this).val()
                                    );

                                    column
                                        .search(val ? '^' + val + '$' : '', true, false)
                                        .draw();
                                });

                            column.data().unique().sort().each(function(d, j) {
                                select.append('<option value="' + d + '">' + d + '</option>')
                            });
                            var input = $('<br><input type="text" class="filtro-tabla"/>')
                                .appendTo($('.inputSelect', column.header()).empty())
                                .on('keyup change', function() {
                                    if (column.search() !== this.value) {
                                        column
                                            .search(this.value)
                                            .draw()
                                    }
                                });
                        });
                    }
                })
            }, 100)
        },
        tableBasica: function(dataTable) {
            $('#' + dataTable).DataTable().destroy();
            setTimeout(function() {
                $('#' + dataTable).DataTable({
                    searching: false
                })
            }, 100)
        }
    }
})

// $(document).ready(function() {
//     $('#example').DataTable({
//         initComplete: function() {
//             this.api().columns().every(function() {
//                 var column = this;
//                 var select = $('<select><option value=""></option></select>')
//                     .appendTo($(column.footer()).empty())
//                     .on('change', function() {
//                         var val = $.fn.dataTable.util.escapeRegex(
//                             $(this).val()
//                         );

//                         column
//                             .search(val ? '^' + val + '$' : '', true, false)
//                             .draw();
//                     });

//                 column.data().unique().sort().each(function(d, j) {
//                     select.append('<option value="' + d + '">' + d + '</option>')
//                 });
//             });
//         }
//     });
// });