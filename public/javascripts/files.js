//utils
// var file_id;
var googleDriveIds=[];
var dropboxIds=[];
var chosenFolderId;
var chosenFolderType;
function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};


/******************************************************************
**************************** Call API *****************************
*******************************************************************/
function deleteFile(id, folderType, callback){
    console.log(id);
    $.ajax({
        url: API_URL + 'file/delete?id=' + id +'&type=' + folderType,
        type: "get",
        dataType: 'json',
        success: function( result ) {
            console.log(result);
            if(googleDriveIds.length>0 || dropboxIds.length>0){
                getFileChildren()
            }
            else
                getAllFiles();
            callback();
        },
        error: function( err ) {
            console.log( "ERROR:  " + JSON.stringify(err) );
            callback();
        }
    });
}

function getAllFiles(){
    var spinner = '<td class="spinner-contains">' +
                    '<div class="spinner">' +
                        '<div class="bounce1"></div>' +
                        '<div class="bounce2"></div>' +
                        '<div class="bounce3"></div>' +
                    '</div>' +
                '</td>';
    $(".list-files").empty();           
    $(".list-files").html(spinner);
    $.ajax({
        url: API_URL + 'file/root/map',
        type: "get",
        dataType: 'json',
        success: function( result ) {


            console.log(result);
            $(".list-files").empty();

            let listFileKeys = Object.keys(result);
            if(listFileKeys.length <= 0){
                $(".list-files").append("<tr><td><h1>No file in drive</h1></td></tr>");
            } else{
                _.map(listFileKeys, function(fileKey){
                    let file = result[fileKey];
                    console.log(file);
                    let fileDisplay = displayFile(file);
                    $(".list-files").append(fileDisplay);
                })
            }            
        },
        error: function( err ) {
            console.log( "ERROR:  " + JSON.stringify(err) );

        }
    });
}


function getFileChildren(){
    var spinner = '<td class="spinner-contains">' +
                    '<div class="spinner">' +
                        '<div class="bounce1"></div>' +
                        '<div class="bounce2"></div>' +
                        '<div class="bounce3"></div>' +
                    '</div>' +
                '</td>';
    $(".list-files").empty();           
    $(".list-files").html(spinner);

    var query="";
    if(typeof googleDriveIds !== 'undefined' && googleDriveIds.length > 0){
        googleDriveIds.forEach(function(id){
            query+= "&googleDriveId=" + id;
        })
        
    }

    if(typeof dropboxIds !=='undefined' && dropboxIds.length > 0){
        dropboxIds.forEach(function(id){
            query+= "&dropboxId=" + id;
        })
    }

    $.ajax({
        url: API_URL + 'file/children?' + query.substring(1),
        type: "get",
        dataType: 'json',
        success: function( result ) {


            console.log(result);
            // _.filter(result, function(file){
            //     return file.
            // })
            $(".list-files").empty();
            let listFileKeys = Object.keys(result);
            if(listFileKeys.length <= 0){
                $(".list-files").append("<tr><td><h1>No file in drive</h1></td></tr>");
            } else{
                _.map(listFileKeys, function(fileKey){
                    let file = result[fileKey];
                    console.log(file);
                    let fileDisplay = displayFile(file);
                    $(".list-files").append(fileDisplay);
                })
            }
            
        },
        error: function( err ) {
            console.log( "ERROR:  " + JSON.stringify(err) );

        }
    });
}

function uploadFile(){
    console.log("upload file");
    var form = $('#uploadFile')[0];
    var fd = new FormData(form);    
    $.ajax({
        url: API_URL + 'file/upload',
        type: "post",
        enctype: 'multipart/form-data',
        processData: false,
        data: fd,
        contentType: false,
        cache: false,
        timeout: 1000000,
        success: function( file ){
            console.log(file);
            if(googleDriveIds.length>0 || dropboxIds.length>0){
                getFileChildren();
            } else{
                getAllFiles();    
            }
            
        },
        error: function( err ) {
            console.log( "ERROR:  " + JSON.stringify(err) );

        }
    });
}

function createFolder(folder_name){
    var data={
        folderName: folder_name,
        parentId: chosenFolderId || "",
        folderType: (chosenFolderType)? chosenFolderType : "googleDrive"
    }
    var url = API_URL + 'file/createFolder';
    $.ajax({
        url: url,
        type: "post",
        dataType: 'json',
        contentType: 'application/json',
        data : JSON.stringify(data),
        success: function( result ) {
            console.log(result);
            if(googleDriveIds.length>0 || dropboxIds.length>0){
                getFileChildren(file_id)
            } else{
                getAllFiles();
            }
        },
        error: function( err ) {
            console.log( "ERROR:  " + JSON.stringify(err) );
            console.log(err.responseJSON);
        }
    });
}

function renameFile(fileid, fileSource){
    var newName = $("#newFileName").val();
    console.log($("#newFileName"));
    console.log(newName);
    if(!newName || newName.length<=0){
        alert("Missing new file name");
        return;
    }
    
    var data={
        newName: newName,
        fileId: fileid || "",
        fileSource: (fileSource)? fileSource : "googleDrive"
    }
    var url = API_URL + 'file/rename';
    $.ajax({
        url: url,
        type: "post",
        dataType: 'json',
        contentType: 'application/json',
        data : JSON.stringify(data),
        success: function( result ) {
            console.log(result);
            $("#newFileName").val('');
            if(googleDriveIds.length>0 || dropboxIds.length>0){
                getFileChildren(file_id)
            } else{
                getAllFiles();
            }
        },
        error: function( err ) {
            console.log( "ERROR:  " + JSON.stringify(err) );
            console.log(err.responseJSON);
        }
    });
}
/******************************************************************
***************************** Display *****************************
*******************************************************************/

function doModal(placementId, heading, formContent, strSubmitFunc, btnText)
{
    var html =  '<div id="modalWindow" class="modal fade" role="dialog" style="display:none;">';
    html += '<div class="modal-dialog">';
    html += '<div class="modal-content">';
    html += '<div class="modal-header">';
    html += '<a class="close" data-dismiss="modal">×</a>';
    html += '<h4>'+heading+'</h4>'
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<p>';
    html += formContent;
    html += '</div>';
    html += '<div class="modal-footer">';
    if (btnText!='') {
        html += '<span class="btn btn-success" data-dismiss="modal" ';
        html += ' onClick="'+strSubmitFunc+'">'+btnText;
        html += '</span>';
    }
    html += '<span class="btn" data-dismiss="modal">';
    html += 'Close';
    html += '</span>'; // close button
    html += '</div>';  // footer
    html += '</div>';  // modal-content
    html += '</div>';  // modal-dialog
    html += '</div>';  // modalWindow
    $("#"+placementId).html(html);
    $("#modalWindow").modal();
}


function hideModal()
{
    // Using a very general selector - this is because $('#modalDiv').hide
    // will remove the modal window but not the mask
    $('.modal.in').modal('hide');
}

function displayFile(file){

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var row = document.createElement("div");
    row.className = "row";
    row.style.display= "flex";

    //==================================================//
    var col_source = document.createElement("div");
    col_source.className = "col-xs-2 col-sm-1";
    
    var source = document.createElement("div");

    if(file.googleDriveIds && file.googleDriveIds.length>0 
        && file.dropboxIds && file.dropboxIds.length > 0){
        source.innerHTML = "Google Drive <br> + <br> DropBox"
    } else{
        if(file.googleDriveIds && file.googleDriveIds.length>0){
            source.innerHTML = "Google Drive"
        } 
        if(file.dropboxIds && file.dropboxIds.length > 0){
            source.innerHTML = "DropBox"
        } 
    }
    source.style.textAlign="center";
    col_source.appendChild(source);


    //==================================================//
    var col_img = document.createElement("div");
    col_img.className = "col-xs-1";

    if(file.icon){
        var img = document.createElement("img");
        img.setAttribute("src", file.icon);
        img.style.width="100%";
        img.style.maxWidth="16px";
        col_img.appendChild(img);
    } else{
        if(file.mimeType && file.mimeType=="folder"){
            var icon = document.createElement("div");
            icon.innerHTML = "Folder";
            col_img.appendChild(icon);
        } else{
            var icon = document.createElement("div");
            icon.innerHTML = "File";
            col_img.appendChild(icon);
        }
    }
    

    //==================================================//
    var col_title = document.createElement("div");
    col_title.className = "col-xs-5";
    var title = document.createElement("div");
    title.className= "file-title";
    title.innerHTML = file.title;

    col_title.appendChild(title);
    if(file.mimeType && file.mimeType.indexOf("folder") >-1){
        col_title.style.cursor= "pointer";
        col_title.addEventListener('dblclick', function(){ 
            let navigateSite = CLIENT_URL + "files?";
            let query="";
            if(file.googleDriveIds && file.googleDriveIds.length > 0){
                file.googleDriveIds.forEach(function(id){
                    query+= "&googleDriveId=" + id;
                })
                
            }

            if(file.dropboxPaths && file.dropboxPaths.length > 0){
                file.dropboxPaths.forEach(function(id){
                    query+= "&dropboxId=" + id;
                })
            }
            query+="&folderName=" + file.title;
            console.log(query.substring(1));
          window.location.href= navigateSite + query.substring(1);

        });
    }
    
    //==================================================//
    var col_size = document.createElement("div");
    col_size.className = "col-xs-1 file-size";
    var size = document.createElement("div");
    size.innerHTML = (file.size)? bytesToSize(file.size) : "";

    col_size.appendChild(size);

    //==================================================//
    var col_delete = document.createElement("div");
    col_delete.className = "col-xs-2 col-lg-1";
    var delete_button = document.createElement("button");
    delete_button.innerHTML = "Delete";
    delete_button.style.height="100%";

    delete_button.addEventListener("click", function(){
        delete_button.disabled = true;
        if(typeof fading_circle_spinner !== 'undefined' && fading_circle_spinner)
            delete_button.innerHTML = fading_circle_spinner;

        if(file.googleDriveIds && file.googleDriveIds.length > 0){
            file.googleDriveIds.forEach(function(id){
                deleteFile(id, "googleDrive", function(){
                    delete_button.innerHTML = "Delete";
                    delete_button.disabled = false;
                });
            })
                
        }

        if(file.dropboxIds && file.dropboxIds.length > 0){
            file.dropboxIds.forEach(function(id){
                deleteFile(id, "dropbox", function(){
                    delete_button.innerHTML = "Delete";
                    delete_button.disabled = false;
                });
            })
                
        }
    });

    col_delete.appendChild(delete_button);

    //==================================================//
    var col_rename = document.createElement("div");
    col_rename.className = "col-xs-2 col-lg-1";
    var rename_button = document.createElement("button");
    rename_button.innerHTML = "Rename";
    rename_button.style.height="100%";
    rename_button.setAttribute("data-toggle", "modal");
    rename_button.setAttribute("data-toggle", "#renameFileModal");

    col_rename.appendChild(rename_button);
    rename_button.addEventListener("click", function(){
        var header = "Rename";
        var content = "<input type='text' id='newFileName'>";
        var strSubmitFunc="";
        if(file.googleDriveIds && file.googleDriveIds.length > 0){
            file.googleDriveIds.forEach(function(id){
                strSubmitFunc += "renameFile('" + id+ "','googleDrive');"
            })
                
        }
        if(file.dropboxPaths && file.dropboxPaths.length > 0){
            file.dropboxPaths.forEach(function(id){
                strSubmitFunc += "renameFile('" + id+ "','dropbox');"
            })
                
        }
        var btnText = "Rename";
        doModal('renameFileModal', header, content, strSubmitFunc, btnText);
    });

    //==================================================//
    row.appendChild(col_source);
    row.appendChild(col_img);
    row.appendChild(col_title);
    row.appendChild(col_size);
    row.appendChild(col_delete);
    row.appendChild(col_rename);
    //==================================================//
    td.appendChild(row);
    tr.appendChild(td);
    return tr;

}

$(document).on('change', '.btn-file :file', function(e) {
    console.log(e);
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
    if(chosenFolderId)
        $("#folderId").val(chosenFolderId);
    else{
        $("#folderId").val(null);
    }

    if(chosenFolderType){
        $("#folderType").val(chosenFolderType);
    } else{
        $("#folderType").val("googleDrive");
    }
    uploadFile();
});


$(document).ready(function(){
    if(!getCookie("dasa_token")){
        window.location.href=CLIENT_URL+ "login";
        return;
    }
    var params = window.location.search.substring(1).split('&');
    console.log(params);
    var folderName;
    for (i=0;i<params.length;i++) {
        val = params[i].split("=");
        switch(val[0]){
            case "googleDriveId":
                googleDriveIds.push(val[1]);
                break;
            case "dropboxId":
                dropboxIds.push(val[1]);
                break;
            case 'folderName':
                folderName = val[1];
                break;
        }
    }
    if(googleDriveIds.length>1 || dropboxIds.length>1 || (googleDriveIds.length>0 && dropboxIds.length>0)){
        //more than 1 folder
        $(".folder-chosen h6").html("Folder name: "+ folderName + "<br>This is a combined folder between these below folder with the same name. Select a folder to make an upload of file or sub-folder to that certain folder" )
        googleDriveIds.forEach(function(id, index){
            let newInput = document.createElement("input");
            newInput.id = "googleDrive"+ id;
            newInput.name = "chosenFolder";
            newInput.type = "radio";

            newInput.onchange = function(){
                chosenFolderId = id;
                chosenFolderType = "googleDrive";
                console.log(chosenFolderId);
                console.log(chosenFolderType);
            }

            let label = document.createElement("label");

            label.htmlFor = "googleDrive"+ id;
            label.innerHTML="Google Drive folder with id: " + id;


            if(index==0){
                chosenFolderId = id;
                chosenFolderType = "googleDrive";
                newInput.checked = true;
            }

            $(".folder-chosen").append(newInput);
            $(".folder-chosen").append(label);
            $(".folder-chosen").append("<br>");
            

            // document.body.insertBefore(document.createElement("BR"), element);
            // document.body.insertBefore(newInput,element);
            // document.body.insertBefore(label, newInput);
        })

        dropboxIds.forEach(function(id, index){
            let newInput = document.createElement("input");
            newInput.id = "dropbox"+ id;
            newInput.name = "chosenFolder";
            newInput.type = "radio";

            newInput.onchange = function(){
                chosenFolderId = id;
                chosenFolderType = "dropbox";
                console.log(chosenFolderId);
                console.log(chosenFolderType);
            }
            
            let label = document.createElement("label");

            label.htmlFor = "dropbox"+ id;
            label.innerHTML="Dropbox folder with id: " + id;


            if(index==0 && googleDriveIds.length<=0){
                chosenFolderId = id;
                chosenFolderType = "dropbox";
                newInput.checked = true;
            }


            $(".folder-chosen").append(newInput);
            $(".folder-chosen").append(label);
            $(".folder-chosen").append("<br>");
            

            // document.body.insertBefore(document.createElement("BR"), element);
            // document.body.insertBefore(newInput,element);
            // document.body.insertBefore(label, newInput);
        })
    }

    if(googleDriveIds.length==1  && dropboxIds.length==0){
        //only 1 folder google drive
        chosenFolderId = googleDriveIds[0];
        chosenFolderType = "googleDrive";
        $(".folder-chosen h6").html("Folder name: "+ folderName )
    }
    if (googleDriveIds.length==0  && dropboxIds.length==1){

        //only 1 folder dropbox
        chosenFolderId = dropboxIds[0];
        chosenFolderType = "dropbox";
        $(".folder-chosen h6").html("Folder name: "+ folderName )
    }
    if(googleDriveIds.length>0 || dropboxIds.length>0) {

        getFileChildren();
        
    }
    else{
        $(".folder-chosen h6").html("Root folder<br>This is a combined folder between these below folder. Select a folder to make an upload of file or sub-folder to that certain folder" )

        /************************* Google drive ********************/
        let googleDriveSelector = document.createElement("input");
        googleDriveSelector.id = "googleDrive";
        googleDriveSelector.name = "chosenFolder";
        googleDriveSelector.type = "radio";
        googleDriveSelector.checked = true;

        googleDriveSelector.onchange = function(){
            chosenFolderId = "";
            chosenFolderType = "googleDrive";
        }
        
        let googleDriveLabel = document.createElement("label");

        googleDriveLabel.htmlFor = "googleDrive";
        googleDriveLabel.innerHTML="Google Drive";

        chosenFolderId = "";
        chosenFolderType = "googleDrive";
        


        $(".folder-chosen").append(googleDriveSelector);
        $(".folder-chosen").append(googleDriveLabel);
        $(".folder-chosen").append("<br>");

        /************************* Dropbox ********************/
        let dropboxSelector = document.createElement("input");
        dropboxSelector.id = "dropbox";
        dropboxSelector.name = "chosenFolder";
        dropboxSelector.type = "radio";

        dropboxSelector.onchange = function(){
            chosenFolderId = "";
            chosenFolderType = "dropbox";
        }
        
        let dropboxLabel = document.createElement("label");

        dropboxLabel.htmlFor = "dropbox";
        dropboxLabel.innerHTML="Dropbox";

        $(".folder-chosen").append(dropboxSelector);
        $(".folder-chosen").append(dropboxLabel);
        $(".folder-chosen").append("<br>");
        getAllFiles();
    }


    $("#btn-create-folder").on("click", function(){
        var folderName = $("#folderName").val();
        if(!folderName || folderName==""){
            alert("Missing folder name");
        } else{
            createFolder(folderName);
            $("#folderName").val("");
        }
    })
})