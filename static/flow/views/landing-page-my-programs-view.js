//
// A view representing a main landing page
// which can display "My Programs", "Recording Now" data
// and "Previously Recorded" data
//
var LandingPageMyProgramsView = function(options) {

    var base = BaseView(options);
   

    //
    // AJAX call and handler for updating "My Programs" div.
    //
    var loadPrograms = function(div) {

        console.log("[DEBUG] loadPrograms loading My Programs...");

        div.empty();
        div.text("Loading My Programs...");

        var url = '/ext/flow/list_programs';

        $.ajax({
            url: url,
            method: 'GET',
            // data: data,
            success: function(data) {
                var response = JSON.parse(data);
                console.log("[DEBUG] List programs", response);
                if(response.success) {
                   
                    div.empty();
                    div.css('width', '200px');

                    var title = jQuery('<div>');
                    title.text("My Programs");
                    title.appendTo(div);

                    console.log("[DEBUG] loadPrograms Creating My Programs table...");

                    var table = jQuery('<table>', 
                                    { css: {  margin: '0 auto' } } );

                    var files = response.files;
                    var row = [];
                    for(var i = 0; i < files.length; i++) {

                        var wrapper = jQuery('<div>', 
                                        { css: {    testAlign: 'center',
                                                    padding: '10px' } });

                        var icon = ProgramIcon( {   container:  wrapper,
                                                    filename:   files[i] } );

                        row.push(wrapper);

                        if (i % 2 == 1) {
                            Util.addTableRow(table, row);
                            row = [];
                        }
                    }
                    if (i % 2 == 1) {
                        row.push(jQuery('<div>'));
                        Util.addTableRow(table, row);
                    }
                    table.appendTo(div);

                } else {
                    console.log("[ERROR] Error listing programs", response);
                }
            },
            error: function(data) {
                console.log("[DEBUG] List programs error", data);
            },
        });
        
    };

    base.show = function() {
        var content = jQuery('#'+base.getDivId());
        loadPrograms(content);
    }

    return base;
}