//utils
var file_id;
function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};


/******************************************************************
**************************** Call API *****************************
*******************************************************************/
function deleteFile(id, callback){
    $.ajax({
        url: API_URL + 'file/' + id +"/delete",
        type: "get",
        dataType: 'json',
        success: function( result ) {
            console.log(result);
            if(file_id)
                getFileChildren(file_id)
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
        url: API_URL + 'file/all',
        type: "get",
        dataType: 'json',
        success: function( result ) {


            console.log(result);
            // _.filter(result, function(file){
            //     return file.
            // })
            $(".list-files").empty();


            if(result.items.length <= 0){
                $(".list-files").append("<tr><td><h1>No file in drive</h1></td></tr>");
            } else{
                var list_items = _.filter(result.items, function(item){
                    return (item.parents && item.parents.length > 0 && item.parents[0].isRoot)
                })
                _.map(list_items, function(file){
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

function getInnerFileInfo(file_id){
    $.ajax({
        url: API_URL + 'file/' + file_id,
        type: "get",
        dataType: 'json',
        success: function( file ){
            console.log(file);

            let fileDisplay = displayFile(file);
            $(".list-files").append(fileDisplay);
            
        },
        error: function( err ) {
            console.log( "ERROR:  " + JSON.stringify(err) );

        }
    });
}

function getFileChildren(file_id){
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
        url: API_URL + 'file/' + file_id + "/children",
        type: "get",
        dataType: 'json',
        success: function( result ) {


            console.log(result);
            // _.filter(result, function(file){
            //     return file.
            // })
            $(".list-files").empty();

            if(result.items.length <= 0){
                $(".list-files").append("<tr><td><h1>No file in drive</h1></td></tr>");
            } else{
                _.map(result.items, function(file){
                    getInnerFileInfo(file.id);
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
            if(file_id){
                getFileChildren(file_id);
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
        folderName: folder_name
    }
    var url = API_URL + 'file/createFolder';
    if(file_id){
        url = API_URL + 'file/createFolder/' + file_id;
    }
    $.ajax({
        url: url,
        type: "post",
        dataType: 'json',
        contentType: 'application/json',
        data : JSON.stringify(data),
        success: function( result ) {
            console.log(result);
            if(file_id){
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
function displayFile(file){

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var row = document.createElement("div");
    row.className = "row";
    row.style.display= "flex";
    //==================================================//
    var col_img = document.createElement("div");
    col_img.className = "col-xs-1";

    var img = document.createElement("img");
    img.setAttribute("src", file.iconLink);
    img.style.width="100%";
    img.style.maxWidth="16px";
    col_img.appendChild(img);

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

          window.location.href=CLIENT_URL + "files?id=" + file.id;

        });
    }
    
    //==================================================//
    var col_size = document.createElement("div");
    col_size.className = "col-xs-1 file-size";
    var size = document.createElement("div");
    size.innerHTML = (file.fileSize)? bytesToSize(file.fileSize) : "";

    col_size.appendChild(size);

    //==================================================//
    var col_delete = document.createElement("div");
    col_delete.className = "col-xs-1";
    var delete_button = document.createElement("button");
    delete_button.innerHTML = "Delete";
    delete_button.style.height="100%";

    delete_button.addEventListener("click", function(){
        delete_button.disabled = true;
        if(typeof fading_circle_spinner !== 'undefined' && fading_circle_spinner)
            delete_button.innerHTML = fading_circle_spinner;

        deleteFile(file.id, function(){
            delete_button.innerHTML = "Delete";
            delete_button.disabled = false;
        });
    });

    col_delete.appendChild(delete_button);

    //==================================================//
    row.appendChild(col_img);
    row.appendChild(col_title);
    row.appendChild(col_size);
    row.appendChild(col_delete);
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
    if(file_id)
        $("#folderId").val(file_id);
    else{
        $("#folderId").val(null);
    }
    uploadFile();
});


$(document).ready(function(){
    var params = window.location.search.substring(1).split('&');
    console.log(params);
    for (i=0;i<params.length;i++) {
        val = params[i].split("=");
        switch(val[0]){
            case "id":
                file_id= val[1];
                break;                      
        }
    }
    if(file_id)
        getFileChildren(file_id)
    else
        getAllFiles();

    $("#btn-create-folder").on("click", function(){
        var folderName = $("#folderName").val();
        if(!folderName || folderName==""){
            alert("Missing folder name");
        } else{
            createFolder(folderName);
        }
    })
})