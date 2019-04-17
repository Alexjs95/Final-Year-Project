window.onload = function(){
    (function(){
        function onclick(event) {
            let files = document.getElementById('selectFiles').files;
            console.log(files);
            if (files.length <= 0) {
                return false;
            }

            let fr = new FileReader();

            fr.onload = function(e) {
                console.log(e);
                let result = JSON.parse(e.target.result);

                let formatted = JSON.stringify(result, null, 2);
                document.getElementById('json-contents').value = formatted;
            }
            fr.readAsText(files.item(0));
        }
        document.getElementById('upload').addEventListener('click', onclick);
    }());


};


