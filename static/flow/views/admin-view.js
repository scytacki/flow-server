//
// Admin view
//
var AdminView = function(options) {

    var base = BaseView(options);
    var _this = this;

    var content = jQuery('#'+base.getDivId());

    this.adminControllerIdMap = {};

    this.heading = $('<h2>', { css: { textAlign: 'center' } } );
    this.heading.html('Controller Administration  ');
    this.heading.appendTo(content);

    var addButton = function(text, func) {

        var button = $('<button>', {    css: {  position: 'relative',
                                                bottom: '5px' },
                                        html: text });

        button.css('font-size','10px');
        button.appendTo(this.heading);

        button.click(func);
    }


    addButton("Refresh",   
        function() {
            _this.loadAdminViewData();
        });

    addButton("Exit",   
        function() {
            showTopLevelView('landing-page-view');
        });


    //
    // Make ajax call to obtain admin controller data
    //
    this.loadAdminViewData = function() {

        var controllerAdminContent = $('#'+base.getDivId());
        controllerAdminContent.empty();

        this.heading.appendTo(controllerAdminContent);
        controllerAdminContent.append(
            $('<div>', { css: { paddingLeft: '10px' } } ).text("Loading...")
        );

        $.ajax({
            url: '/ext/flow/controllers',
            method: 'GET',
            // data: {},
            success: function(data) {
                renderAdminViewData(data);
            },
            error: function(data) {
                alert('Error loading admin data.')
            },
        });
    }

    //
    // Util function to create table headers.
    //
    this.createAdminTableHeader = function() {
        return  $('<div>', { css: { textAlign: 'center',
                                    paddingBottom: '10px' } });
    }

    //
    // Util function to create table cells.
    //
    this.createAdminTableCell = function(id) {
        return  $('<div>', {    id: id,
                                css: {  textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        paddingBottom: '5px' } });
    }


    //
    // Render admin controller data returned by ajax API call.
    //
    this.renderAdminViewData = function(data) {

        // console.log("[DEBUG] renderAdminViewData", data);

        var controllerAdminContent = $('#'+base.getDivId());
        controllerAdminContent.empty();
        _this.heading.appendTo(controllerAdminContent);

        var controllers = JSON.parse(data);
        _this.adminControllerIdMap = {};

        var serverInfo = $('<table>', {} );
        Util.addTableRow(serverInfo, [
                                        $('<div>').text("Flow Server Version: "), 
                                        $('<div>').text(g_flow_server_version)  ]);
        Util.addTableRow(serverInfo, [
                                        $('<div>').text("Rhizo Server Version: "),
                                        $('<div>').text(g_rhizo_server_version) ]);
        
        serverInfo.appendTo(controllerAdminContent);
        $('<br>').appendTo(controllerAdminContent);

        //
        // Main admin controller table
        //
        var table = $('<table>', { css: { width: '90%' } } );
        table.appendTo(controllerAdminContent);

        //
        // Add table headers
        //
        Util.addTableRow(table, 
                [   _this.createAdminTableHeader().html('<b>Status</b>'), 
                    _this.createAdminTableHeader().html('<b>Recording</b>'),
                    _this.createAdminTableHeader().html('<b>Controls</b>'),
                    _this.createAdminTableHeader().html('<b>Last Online</b>'),
                    _this.createAdminTableHeader().html('<b>Name</b>'),
                    _this.createAdminTableHeader().html('<b>Version</b>'),
                    _this.createAdminTableHeader().html('<b>Updates</b>')    ]);

        if (controllers.length) {
            controllers.sort(Util.sortByName);

            // console.log("[DEBUG] Admin view controllers", controllers);

            for (var i = 0; i < controllers.length; i++) {

                (function(_i) {

                    var controller = controllers[_i];
                    _this.adminControllerIdMap[controller.path] = _i;

                    // console.log("[DEBUG] Admin view controller", controller);

                    //
                    // Online status
                    //
                    var onlineDiv = _this.createAdminTableCell('admin_online_status_'+_i);

                    //
                    // Recording status
                    //
                    var recordingDiv = _this.createAdminTableCell('admin_recording_status_'+_i);

                    //
                    // Recording controls
                    //
                    var recordingControlDiv = _this.createAdminTableCell('admin_recording_control_'+_i);

                    var createRecordingControl = function(text, func) {
                        var button = $('<button>', 
                                        {   css: {  
                                                    
                                                    bottom: '5px' },
                                            html: text });
                        button.css('font-size','10px');
                        button.click(func);
                        return button;
                    };

                    var start = createRecordingControl('Start Recording',
                        function() {
                            var path = _this.adminControllerIdMap[_i];
                            _this.sendAdminMessage( path, 
                                                    'start_recording',
                                                    {} );
                        }
                    );

                    var stop = createRecordingControl('Stop Recording',
                        function() {
                            var path = _this.adminControllerIdMap[_i];
                            _this.sendAdminMessage( path, 
                                                    'stop_recording',
                                                    {} );
                        }
                    );

                    start.appendTo(recordingControlDiv);
                    $('<br>').appendTo(recordingControlDiv);
                    stop.appendTo(recordingControlDiv);

                    //
                    // Last online time
                    //
                    var lastOnlineDiv = _this.createAdminTableCell('admin_last_online_'+_i);

                    //
                    // Controller name
                    //
                    var nameDiv = _this.createAdminTableCell('admin_controller_name_'+_i);

                    //
                    // Version
                    //
                    var versionDiv = _this.createAdminTableCell('admin_version_div_'+_i);
                
                    //
                    // Available versions (Updates column)
                    //
                    var swUpdateDiv = $('<div>', {
                                                id: 'software_update_'+i,
                                                css: {  float: 'right',
                                                        width: '100%',
                                                        paddingBottom: '10px',
                                                        textAlign: 'right' } } );



                    //
                    // Now build a complete table row for this controller.
                    //
                    Util.addTableRow(table, [   onlineDiv, 
                                                recordingDiv,
                                                recordingControlDiv,
                                                lastOnlineDiv,
                                                nameDiv, 
                                                versionDiv,
                                                swUpdateDiv ]);

                    //
                    // Update table row cells with controller info.
                    //
                    _this.setAdminOnlineStatus(    _i, controller.online);
                    _this.setAdminRecordingStatus( _i, controller.status);
                    _this.setAdminLastOnline(      _i, controller.last_online);
                    _this.setAdminControllerName(  _i, controller.name);
                    _this.setAdminVersionInfo(     _i, controller.status);

                    if(controller.status.operational_status == "UPDATING") {
                        swUpdateDiv.text("Updating...");
                    } else {
                        _this.setAdminAvailableVersions(   
                                            _i, 
                                            controller.status.available_versions, 
                                            controller.path);
                    }

                })(i);
     
            }
        }
    }

    //
    // Set online status (note this comes from the REST API, not the
    // status message.
    //
    this.setAdminOnlineStatus = function(i, isOnline) {

        // console.log("[DEBUG] setAdminOnlineStatus", i, isOnline);

        var onlineDiv = $('#admin_online_status_'+i);
        onlineDiv.empty();

        var cls = "circle red";
        if(isOnline) {
            cls = "circle green";
        }
        var onlineCircle = $('<div>', { class: cls } );
        var onlineText = $('<div>');
        onlineCircle.appendTo(onlineDiv);
        onlineText.text(isOnline ? "online" : "offline");
        onlineText.appendTo(onlineDiv);
    }

    //
    // Set recording status
    //
    this.setAdminRecordingStatus = function(i, status) {

        var recordingDiv = $('#admin_recording_status_'+i);
        recordingDiv.empty();

        if(status.recording_interval != null) {
            // Add check mark
            recordingDiv.html("&#10004;");
        }

    }

    //
    // Set last online status.
    // Note this comes from the REST API, not the status message
    //
    this.setAdminLastOnline = function(i, last_online) {
        var lastOnlineDiv = $('#admin_last_online_'+i);
        lastOnlineDiv.text(last_online);
    }

    //
    // Set admin controller name
    //
    this.setAdminControllerName = function(i, name) {
        var nameDiv = $('#admin_controller_name_'+i);
        nameDiv.text(name);
    }

    //
    // Set controller version info
    //
    this.setAdminVersionInfo = function(i, status) {

        var versionDiv = $('#admin_version_div_'+i);
        versionDiv.empty();

        var verTable = $('<table>');
        verTable.appendTo(versionDiv)
        Util.addTableRow(verTable, [
                        $('<div>').text("Flow:"),
                        $('<div>', { css: { whiteSpace: 'nowrap' } } ).text(status.flow_version) ] );
                    
        Util.addTableRow(verTable, [
                        $('<div>').text("Rhizo:"),
                        $('<div>', { css: { whiteSpace: 'nowrap' } } ).text(status.lib_version) ] );

    }

    //
    // Set available versions and software update buttons
    //
    this.setAdminAvailableVersions = function(i, version_list, path) {

        var swUpdateDiv = $('#software_update_'+i)
        swUpdateDiv.empty();

        var swUpdateTable = $('<table>', { css: { float: 'right' } } );

        var availableVersionsDiv = _this.createAdminTableCell('software_versions_'+i);
        var select = $('<select>', {    id: 'sw_version_select_'+i,
                                        css: { fontSize: '10px' } } );
        select.appendTo(availableVersionsDiv);

        if(version_list && version_list.length) {
            for(var i = 0; i < version_list.length; i++) {
                var opt = $('<option>', {   text:   version_list[i], 
                                            value:  version_list[i]     });
                opt.appendTo(select);
            }
        }

        //
        // Create buttons used for sw update.
        //
        var softwareButton = function(text, func) {
        
            var button = $('<button>', 
                                        {   css: {  position: 'relative',
                                                    width: '100%',
                                                    bottom: '5px' },
                                            html: text });
        
            button.css('font-size','10px');
            button.click(func);
            return button;
        }

        downloadButton  = softwareButton('Check for Updates',
                            function() {
                                _this.downloadSoftwareUpdates(path);
                            });
        
        applyButton     = softwareButton('Apply Update',
                            function() {
                                _this.updateSoftwareVersion(path);
                            });

        swUpdateTable.appendTo(swUpdateDiv);

        Util.addTableRow(swUpdateTable, 
                            [ availableVersionsDiv, downloadButton ] );
        Util.addTableRow(swUpdateTable, 
                            [ _this.createAdminTableCell(), applyButton ] );

    }

    //
    // Send a message to a controller.
    //
    this.sendAdminMessage = function(path, type, params, response_func) {

        addMessageHandler( type + "_response", response_func );

        subscribeToFolder(path);
        setTargetFolder(path);
        if(g_webSocketInited) {
            sendSubscriptions();
            sendMessage(type, params);
            return;
        }
        connectWebSocket(function() {
            console.log("INFO connecting websocket");
            sendMessage(type, params);
        });
    }

    //
    // Download latest versions onto a controller.
    //
    this.downloadSoftwareUpdates = function(path) {
        
        console.log("[DEBUG] downloadSoftwareUpdates", path);

        var id = _this.adminControllerIdMap[path];
        var swUpdateDiv = $('#software_update_'+id)
        swUpdateDiv.text('Downloading updates...');


        sendAdminMessage(   path,
                            'download_software_updates',
                            {},
                            _this.downloadSoftwareUpdatesResponse );
    }

    //
    // Handle response from download_software_updates
    //
    this.downloadSoftwareUpdatesResponse = function(ts, params) {

        console.log("[DEBUG] AdminView.downloadSoftwareUpdatesResponse", params);

        if(!params.success) {
            alert("Error downloading software update for " + params.src_folder);
            return;
        }

        //
        // Now list the latest versions on this controller.
        //
        listSoftwareVersions(params.src_folder)
    }

    //
    // List available software versions on a controller.
    //
    this.listSoftwareVersions = function(path) {

        console.log("[DEBUG] listSoftwareVersions", path);

        var domId = _this.adminControllerIdMap[path];
        var div = $('#software_versions_'+domId);
        div.empty();

        sendAdminMessage(   path,
                            'list_software_versions',
                            {},
                            _this.listSoftwareVersionsResponse );

    }

    //
    // Handle response from list_software_versions
    //
    this.listSoftwareVersionsResponse = function(ts, params) {

        console.log("[DEBUG] AdminView.listSoftwareVersionsResponse", params);

        var path = params['src_folder'];
        var domId = _this.adminControllerIdMap[path];

        setAdminAvailableVersions(domId, params['version_list'], path);

    }


    //
    // Perform software update
    //
    this.updateSoftwareVersion = function(path) {

        console.log("[DEBUG] updateSoftwareVersion", path);

        var id = _this.adminControllerIdMap[path];
        var value = $('#sw_version_select_'+id).val();

        console.log("[DEBUG] Update to: " + value);

        sendAdminMessage(   path,
                            'update_software_version',
                            { release: value },
                            _this.updateSoftwareVersionResponse );
        
        var div = $('#software_update_'+id);
        div.text('Updating...');
    }

    //
    // Handle update_software_version response message
    //
    this.updateSoftwareVersionResponse = function(ts, params) {

        console.log("[DEBUG] AdminView.updateSoftwareVersionResponse", params);

        var domId = _this.adminControllerIdMap[params['src_folder']];
        var div = $('#software_versions_'+domId);
        div.empty();
        div.text('Updating...');
    }

    base.show = function() {
        $('#'+base.getDivId()).show();
        _this.loadAdminViewData();
    }
    return base;
}

