//
// A view representing a main landing page
// which can display "My Programs", "Recording Now" data
// and "Previously Recorded" data
//
var LandingPageDataSetView = function(options) {

    var base = BaseView(options);

    //
    // AJAX call and handler for updating "Recording Now" and 
    // "Previously Recorded" div.
    //
    var loadDataSets = function(div) {

        // console.log("[DEBUG] loading recorded data...");

        div.empty();
        div.text("Loading recorded data...");

        var url = '/ext/flow/list_datasets';

        $.ajax({
            url:    url,
            method: 'POST',
            data:   { csrf_token: g_csrfToken },
            success: function(data) {
                var response = JSON.parse(data);

                //console.log("[DEBUG] List datasets", response);

                if(response.success) {

                    var items = response.items;
                    var recording = [];
                    var recorded = [];
                    for(var i = 0; i < items.length; i++) {
                        var item = items[i];
                        // console.log("[DEBUG] Checking metadata", item.metadata);
                        if(item.metadata && item.metadata.recording == true) {
                            recording.push(item);
                        } else {
                            recorded.push(item);
                        }
                    }

                    div.empty();
                    
                    var createDataSetList = function(displayName, list) {
                        if(list.length == 0) {
                            return;
                        }
                        for(var i = 0; i < list.length; i++) {
                            var btn = createMyDataSetBtn ( list[i].name, i );
                            btn.appendTo(div);
                            // console.log("[DEBUG] Creating dataset item", items[i]);
                        }
                    }

                    createDataSetList("Recording Now", recording);
                    createDataSetList("Previously Recorded", recorded);
                    
                    if(recording.length == 0 && recorded.length == 0) {
                        addNoDatasetsToMenu(div);
                    }

                } else {
                    addNoDatasetsToMenu(div);
                    console.log("[ERROR] Error listing datasets", response);
                }
            },
            error: function(data) {
                addNoDatasetsToMenu(div);
                console.log("[ERROR] List datasets error", data);
            },
        });
        
    };
    
    //
    //didn't find any datasets, add a menu entry letting the user know there are no datasets available
    //
    this.addNoDatasetsToMenu = function(div){    
        div.empty();
        var emptyButton = $('<div>', {class: 'diagramMenuEntry noSelect menudarkgray'} ).text("no available datasets");
        div.append(emptyButton);
    }
    
    //
    // create a menu item button to load a saved dataset
    //
    var createMyDataSetBtn = function(name, index) {
        var btn;
        var filename = name;
        if(index%2 == 0){
            btn = $('<button>', { text:filename, class: 'diagramMenuEntry menulightgray' } );
        }
        else{
            btn = $('<button>', { text:filename, class: 'diagramMenuEntry menudarkgray' } );
        }
        btn.click(name, function(e) {
            console.log("[DEBUG] DataSetButton click", e.data);
            var dataSetView = getTopLevelView('data-set-view');
            dataSetView.loadDataSet(e.data);
            showTopLevelView('data-set-view');
        });

        return btn;
    }

    base.show = function() {
        var content = jQuery('#'+base.getDivId());
        loadDataSets(content);
    }

    return base;
}
