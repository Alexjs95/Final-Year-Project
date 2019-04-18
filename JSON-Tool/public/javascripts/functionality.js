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


    (function(){
        function onclick(event) {
            let json = document.getElementById('json-contents').value;
            let e = document.getElementById('language');
            let language = document.getElementById('language').options[e.selectedIndex].text;
            let element = document.getElementById('element').value;

            let noOfArrays = 0;
            let noOfObjects = 0;
            let arraysBeforeElement = 0;
            let objectsBeforeElement = 0;

            lengthOfJSON = json.length;


            // TODO: validation on JSON, Language and Element

            let elementPosition = json.search(element);
            if (elementPosition > 0) {
                elementPosition = elementPosition + element.length;
                console.log("element found at position " + elementPosition);

                // Loops through the JSON file.
                for (i = 0; i < lengthOfJSON; i ++) {
                    // checks the character and if its a curly bracket counts it as an object.
                    if (json.charAt(i) == '{') {
                        noOfObjects ++;
                        if (i < elementPosition) {
                            objectsBeforeElement ++;
                        }
                    // checks for square brackets and counts for array.
                    } else if (json.charAt(i) == '[') {
                        noOfArrays ++;
                        if (i < elementPosition) {
                            arraysBeforeElement ++;
                        }
                    }
                }
                // remove contents of json after the found element.
                json = json.substring(0, elementPosition);


                // determine whether the element is a key or a value.
                let elementType = "";
                if (json.lastIndexOf(":") > json.lastIndexOf(",")) {
                    if (json.lastIndexOf("{") > json.lastIndexOf(":")) {
                        elementType = "Key";
                    } else {
                        elementType = "Value";
                    }
                } else {
                    elementType = "Key";
                }

                console.log(json);
                console.log("element is a " + elementType);

                json = json.replace(/:/g, " ");
                json = json.replace(/,/g," ");
                json = json.replace(/"/g,"");
                json = json.replace(/\r\n|\n/g, "");
                json = json.replace(/ {1,}/g," ");

                console.log(json);

                // splits the json array by spaces.
                splitJSON = json.split(" ");

                let jsonSplit = new Array();
                // add the splitted json into an array.
                for (let i = 0; i < splitJSON.length; i++){
                    jsonSplit.push(splitJSON[i]);
                }
                console.log(jsonSplit);

                let keyValues = new Array();
                let datatypes = new Array();
                for (let i = jsonSplit.length - 1; i >= 0; i--) {
                    // last element in array.
                    if (i === jsonSplit.length - 1) {
                        // if element is a value then get item before from array.
                        if (elementType == "Value") {
                            // Check length of element to get relevant key.
                            keyValues.push(jsonSplit[i - element.split(' ').length]);
                            datatypes.push("Key");
                        } else {
                            keyValues.push(jsonSplit[i]);
                            datatypes.push("Key");
                        }
                    }


                    let valueRequired = true;

                    // checks for beginning of object.
                    if (jsonSplit[i] === "{") {
                        // check everything after beginning of object.
                        for (let j = i + 1; j < jsonSplit.length - 1; j++) {
                            // if another object is initialed then break
                            if (jsonSplit[j] === "{") {
                                break;
                            // if the object is closed then the current value of jsonSplit is not required.
                            } else if (jsonSplit[j] === "}") {
                                valueRequired = false;
                                break;
                            }
                        }

                        // Adds only required object values to array.
                        if (i != 0 && valueRequired == true) {
                            keyValues.push(jsonSplit[i - 1]);
                            datatypes.push("Object");
                        }

                        // checks for beginning of Array.
                    } else if (jsonSplit[i] === "[") {
                        // check everything after beginning of array.
                        for (let j = i + 1; j < jsonSplit.length - 1; j++) {
                            // if another array is initialed then break
                            if (jsonSplit[j] === "[") {
                                break;
                                // if the array is closed then the current value of jsonSplit is not required.
                            } else if (jsonSplit[j] === "]") {
                                valueRequired = false;
                                break;
                            }
                        }

                        // Adds only required array values to array.
                        if (i != 0 && valueRequired == true) {
                            keyValues.push(jsonSplit[i - 1]);
                            datatypes.push("Array");
                        }
                    }

                    if (i === 0) {
                        if (jsonSplit[i] === "{") {
                            datatypes.push("Object");
                        } else if (jsonSplit[i] === "[") {
                            datatypes.push("Array");
                        }
                        keyValues.push(jsonSplit[i]);
                    }
                }

                console.log(keyValues);
                console.log(datatypes);

                code = jackson(keyValues, datatypes);
                document.getElementById('code-contents').value = code;
                console.log(code);
            } else {
                console.log("element not found in json");
            }
        }
        document.getElementById('generate-code').addEventListener('click', onclick);
    }());

    function orgjson(keyValues, datatypes) {
        // code for org.json library
        let code = "InputStream is = new FileInputStream(\"/Users/alexscotson/Downloads/jsonexample.json\");";
        code = code + "\nJSONTokener tokener = new JSONTokener(is);"

        for (let i = keyValues.length - 1; i >= 0; i --) {
            // last element of array
            if (i === keyValues.length -1 ) {
                if (keyValues[i] === "{") {
                    code = code + "\nJSONObject " + keyValues[0] + " = new JSONObject(tokener);\n";
                    code = code + "System.out.println(" + keyValues[0];
                } else if (keyValues[i] === "[") {
                    code = code +"\nJSONArray " + keyValues[0] + " = new JSONArray(tokener);\n";
                    code = code + "System.out.println(" + keyValues[0];
                }

                // if (datatypes[i] === "Object") {
                //     code = code + "\nJSONObject " + keyValues[0] + " = new JSONObject(tokener);\n";
                //     code = code + "System.out.println(" + keyValues[0];
                // } else if (datatypes[i] === "Array") {
                //     code = code +"\nJSONArray " + keyValues[0] + " = new JSONArray(tokener);\n";
                //     code = code + "System.out.println(" + keyValues[0];
                // }
            } else {
                if (datatypes[i] === "Object") {
                    code = code + ".getJSONObject(\"" + keyValues[i] + "\")";
                } else if (datatypes[i] === "Array") {
                    code = code + ".getJSONArray(\"" + keyValues[i] + "\")";
                } else if (datatypes[i] === "Key") {
                    code = code + ".get(\"" + keyValues[i] + "\"));";
                }
            }
        }
        return code;
    }


    function jackson(keyValues, datatypes) {
        let code = "InputStream is = new FileInputStream(\"/Users/alexscotson/Downloads/jsonexample.json\");";
        code = code + "\nJSONTokener tokener = new JSONTokener(is);"

        for (let i = keyValues.length - 1; i >= 0; i --) {
            if (i === keyValues.length - 1 ) {
                if (keyValues[i] === "{") {
                    code = code + "\nJSONObject object = new JSONObject(tokener);\n";
                } else if (keyValues[i] === "[") {
                    // TODO:: this is unlikley to work.
                    code = code + "\nJSONArray object = new JSONArray(tokener);\n";
                }

                code = code + "String jsonString = object.toString();\n";
                code = code + "JsonNode rootNode = new ObjectMapper().readTree(new StringReader(jsonString));\n";
            } else {
                if (datatypes[i] === "Key") {
                    if (keyValues.length === 2) {
                        code = code + "JsonNode " + keyValues[i] + " =  rootNode.get(\"" + keyValues[i] + "\");";
                    } else {
                        code = code + "JsonNode " + keyValues[i] + " = " + keyValues[i + 1] + ".get(\"" + keyValues[i] + "\");";
                    }

                } else {
                    if (i === keyValues.length - 2) {
                        code = code + "JsonNode " + keyValues[i] + " = rootNode.get(\"" + keyValues[i] + "\");\n"
                    } else {
                        code = code + "JsonNode " + keyValues[i] + " = " + keyValues[i + 1] + ".get(\"" + keyValues[i] + "\");\n"
                    }
                }
            }
        }
        return code;
    }

};



