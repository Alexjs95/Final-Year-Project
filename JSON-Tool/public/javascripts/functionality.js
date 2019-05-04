window.onload = function(){
    (function(){
        function onclick(event) {
            document.getElementById('code-contents').value = "";
            let file = document.getElementById('selectFiles').files;
            document.getElementById('errors').value = "";

            if (file.length <= 0) {
                return false;
            }

            let fr = new FileReader();

            fr.onload = function(e) {
                let json;
                try {
                    // file contents located in e.target.result
                    json = JSON.parse(e.target.result);
                } catch (e) {
                    // JSON not parsable so display error.
                    document.getElementById('errors').value = "Invalid JSON";
                    return;
                }
                // convert JSON object to string and set display it html.
                document.getElementById('json-contents').value = JSON.stringify(json, null, 2);
            };
            fr.readAsText(file.item(0));
        }
        document.getElementById('upload').addEventListener('click', onclick);
    }());

    (function() {
        function onclick(event) {
            let url =  document.getElementById('url').value
            let json_obj = Get(url);

            // json_obj empty return error.
            if (!json_obj) {
                document.getElementById('errors').value = "JSON cannot be retrieved.";
                return;
            }

            try {
                JSON.parse(json_obj);
            } catch (e) {
                // JSON not parsable so display error.
                document.getElementById('errors').value = "Invalid JSON";
                return;
            }

            // convert JSON object to string and set display it html.
            document.getElementById('json-contents').value = JSON.stringify(json_obj, null, 2);
        }
        document.getElementById('load-url').addEventListener('click', onclick);
    }());


    function Get(yourUrl){
        try {
            let Httpreq = new XMLHttpRequest(); // a new request
            Httpreq.open("GET",yourUrl,false);
            Httpreq.send(null);
            return Httpreq.responseText;
        } catch (err) {
            return err;
        }
    }

    (function(){
        function onclick(event) {
            document.getElementById('code-contents').value = "";
            let json = document.getElementById('json-contents').value;
            let e = document.getElementById('language');
            let language = document.getElementById('language').options[e.selectedIndex].text;
            let element = document.getElementById('element').value;
            let jsonLoc = document.getElementById('url').value;

            document.getElementById('errors').value = "";

            let noOfArrays = 0;
            let noOfObjects = 0;
            let arraysBeforeElement = 0;
            let objectsBeforeElement = 0;

            lengthOfJSON = json.length;

            if (!jsonLoc) {
                jsonLoc = "File";
            }

            if (!json) {
                console.log("json invalid");
                document.getElementById('errors').value = "Invalid JSON";

            } else if (!language) {
                document.getElementById('errors').value = "Select a language or library.";
                console.log("language invalid");
            } else if (!element) {
                document.getElementById('errors').value = "Please enter an element you wish to retrieve.";
                console.log("no element");
            } else {

                try {
                    JSON.parse(json);
                } catch (e) {
                    document.getElementById('errors').value = "Invalid JSON";
                    return;
                }

                let elementPosition = json.search(element);
                if (elementPosition > 0) {
                    elementPosition = elementPosition + element.length;
                    console.log("element found at position " + elementPosition);

                    // Loops through the JSON file.
                    for (i = 0; i < lengthOfJSON; i ++) {
                        // checks the character and if its a curly bracket counts it as an object.
                        if (json.charAt(i) === '{') {
                            noOfObjects ++;
                            if (i < elementPosition) {
                                objectsBeforeElement ++;
                            }
                            // checks for square brackets and counts for array.
                        } else if (json.charAt(i) === '[') {
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

                    json = json.replace(/:/g, " ");
                    json = json.replace(/\//g, " ");
                    json = json.replace(/,/g," ");
                    json = json.replace(/"/g,"");
                    json = json.replace(/\r\n|\n/g, "");
                    json = json.replace(/ {1,}/g," ");


                    // splits the json array by spaces.c
                    splitJSON = json.split(" ");

                    let jsonSplit = new Array();
                    // add the splitted json into an array.
                    for (let i = 0; i < splitJSON.length; i++){
                        jsonSplit.push(splitJSON[i]);
                    }
                    console.log(jsonSplit);

                    let keyValues = new Array();
                    let dataTypes = new Array();
                    for (let i = jsonSplit.length - 1; i >= 0; i--) {
                        // last element in array.
                        if (i === jsonSplit.length - 1) {
                            // if element is a value then get item before from array.
                            if (elementType === "Value") {
                                // Check length of element to get relevant key.
                                keyValues.push(jsonSplit[i - element.split(' ').length]);
                                dataTypes.push("Key");
                            } else {
                                keyValues.push(jsonSplit[i]);
                                dataTypes.push("Key");
                            }
                        }

                        let valueRequired = true;

                        // checks for beginning of object.
                        if (jsonSplit[i] === "{") {
                            let count = 0;
                            // check everything after beginning of object.
                            for (let j = i + 1; j < jsonSplit.length - 1; j++) {
                                // if another object is initialed then break
                                if (jsonSplit[j] === "{") {
                                    count = count + 1;
                                    break;
                                    // if the object is closed then the current value of jsonSplit is not required.
                                } else if (jsonSplit[j] === "}") {
                                    valueRequired = false;
                                    break;
                                }
                            }
                            console.log("count in Object " + count);

                            if (count === 0) {
                                //count = jsonSplit.length - i - 2;
                            } else {
                                count = count - 1;
                            }

                            // Adds only required object values to array.
                            if (i !== 0 && valueRequired === true) {
                                if ((jsonSplit[i - 1] !== "[") && (jsonSplit[i - 1] !== "]") && (jsonSplit[i - 1] !== "{") && (jsonSplit[i - 1] !== "}")) {
                                        keyValues.push(jsonSplit[i - 1]);
                                        dataTypes.push("Object");
                                }
                            }

                            // checks for beginning of Array.
                        } else if (jsonSplit[i] === "[") {
                            let count = 0 ;

                            // check everything after beginning of array.
                            for (let j = i + 1; j < jsonSplit.length - 1; j++) {

                                // if another array is initialed then break
                                if (jsonSplit[j] === "[") {
                                    break;
                                    // if the array is closed then the current value of jsonSplit is not required.
                                } else if (jsonSplit[j] === "]") {
                                    valueRequired = false;
                                    break;
                                } else if (jsonSplit[j] === "{") {
                                    count = count + 1;
                                }
                            }

                            if (count === 0) {
                                count = jsonSplit.length - i - 2;
                            } else {
                                count --;
                            }
                            console.log("count in array " + count);

                            // Adds only required array values to array.
                            if (i !== 0 && valueRequired === true) {

                                if ((jsonSplit[i - 1] !== "[") && (jsonSplit[i - 1] !== "]")) {
                                    keyValues.push(count);
                                    dataTypes.push("Object Count");

                                    keyValues.push(jsonSplit[i - 1]);
                                    dataTypes.push("Array");
                                }
                            } else {
                                keyValues.push(count);
                                dataTypes.push("Key");
                            }
                        }

                        if (i === 0) {
                            if (jsonSplit[i] === "{") {
                                dataTypes.push("Object");
                            } else if (jsonSplit[i] === "[") {
                                dataTypes.push("Array");
                            }
                            keyValues.push(jsonSplit[i]);
                        }
                    }

                    console.log(keyValues);
                    console.log(dataTypes);

                    let code;
                    if (language === "JSON-Java") {
                        code = orgjson(keyValues, dataTypes, jsonLoc);
                    } else if (language === "Jackson") {
                        code = jackson(keyValues, dataTypes, jsonLoc);
                    } else if (language === "GSON") {
                        code = gson(keyValues, dataTypes, jsonLoc);

                    }

                    document.getElementById('code-contents').value = code;
                    console.log(code);
                } else {
                    document.getElementById('errors').value = "The desired element cannot be found in the JSON.";
                    console.log("element not found in json");
                }
            }

            // TODO: validation on JSON, Language and Element

        }
        document.getElementById('generate-code').addEventListener('click', onclick);
    }());

    function orgjson(keyValues, dataTypes, jsonLoc) {
        let code;
        if (jsonLoc === "File") {
            code = "InputStream is = new FileInputStream(\"Enter DIR here\");";
            code = code + "\nJSONTokener tokener = new JSONTokener(is);\n\n";

            if (keyValues[keyValues.length - 1] === "{") {
                code = code + "JSONObject " + keyValues[0] + " = new JSONObject(tokener);\n";
                code = code + "System.out.println(" + keyValues[0];
            } else {
                code = code +"JSONArray " + keyValues[0] + " = new JSONArray(tokener);\n";
                code = code + "System.out.println(" + keyValues[0];
            }

        } else {
            // api code

            code = "InputStream is = new URL(\"" + jsonLoc +"\").openStream();\n";
            code = code + "StringBuilder response = new StringBuilder();\n";
            code = code + "BufferedReader br = new BufferedReader(new InputStreamReader(is, Charset.forName(\"UTF-8\")));\n\n";
            code = code + "String inputLine;\n";
            code = code + "while ((inputLine = br.readLine()) != null)\n";

            code = code + "\tresponse.append(inputLine);\n\n";

            if (keyValues[keyValues.length - 1] === "{") {
                code = code + "JSONObject " + keyValues[0] + " = new JSONObject(response.toString());\n";
                code = code + "System.out.println(" + keyValues[0];
            } else {
                code = code + "JSONArray " + keyValues[0] + " = new JSONArray(response.toString());\n";
                code = code + "System.out.println(" + keyValues[0];
            }
        }

        let numOfKeys = 0;
        for(let i = 0; i < dataTypes.length; i++){
            if(dataTypes[i] === "Key")
                numOfKeys++;
        }


        for (let i = keyValues.length - 1; i >= 0; i --) {
            // last element of array
            if (i === keyValues.length - 1) {
                // if (keyValues[i] === "{") {
                //     code = code + "JSONObject " + keyValues[0] + " = new JSONObject(tokener);\n";
                //     code = code + "System.out.println(" + keyValues[0];
                // } else if (keyValues[i] === "[") {
                //     code = code +"JSONArray " + keyValues[0] + " = new JSONArray(tokener);\n";
                //     code = code + "System.out.println(" + keyValues[0];
                // }

                    // if (dataTypes[i] === "Object") {
                    //     code = code + "\nJSONObject " + keyValues[0] + " = new JSONObject(tokener);\n";
                    //     code = code + "System.out.println(" + keyValues[0];
                    // } else if (dataTypes[i] === "Array") {
                    //     code = code +"\nJSONArray " + keyValues[0] + " = new JSONArray(tokener);\n";
                    //     code = code + "System.out.println(" + keyValues[0];
                    // }

            } else {
                if (dataTypes[i] === "Object") {
                    code = code + ".getJSONObject(\"" + keyValues[i] + "\")";
                } else if (dataTypes[i] === "Array") {
                    code = code + ".getJSONArray(\"" + keyValues[i] + "\")";

                } else if (dataTypes[i] === "Object Count") {
                    code = code + ".getJSONObject(" + keyValues[i] + ")";

                }
                else if (dataTypes[i] === "Key") {
                    if (numOfKeys === 1) {
                        code = code + ".get(\"" + keyValues[i] + "\"));";
                    } else {
                        if (dataTypes[i] === dataTypes.length - 1) {
                            code = code + ".get(" + keyValues[i] + "));";
                            break;
                        } else {
                            if (i === 0) {
                                code = code + ".get(\"" + keyValues[i] + "\"));";
                            }
                        }

                    }
                }
            }
        }
        return code;
    }


    function jackson(keyValues, dataTypes, jsonLoc) {
        let code;
        if (jsonLoc === "File") {
            code = "byte[] jsonData = Files.readAllBytes(Paths.get(\"Enter DIR here\"));";
            code = code + "\nJsonNode rootNode = new ObjectMapper().readTree(jsonData);\n\n";
        } else {
            // api code
            code = "URL url = new URL(\"" + jsonLoc +"\");\n";
            code = code + "JsonNode rootNode = new ObjectMapper().readTree(url);\n\n"
        }

        let numOfKeys = 0;
        for(let i = 0; i < dataTypes.length; i++){
            if(dataTypes[i] === "Key")
                numOfKeys++;
        }

        for (let i = keyValues.length - 1; i >= 0; i --) {
            if (i !== keyValues.length - 1) {
                if (dataTypes[i] === "Key") {
                    if (keyValues.length === 2 || keyValues.length === 3) {
                        if (numOfKeys === 1) {
                            code = code + "JsonNode " + keyValues[i] + " =  rootNode.get(\"" + keyValues[i] + "\");";

                        } else {
                            code = code + "JsonNode obj" + keyValues[i] + " =  rootNode.get(" + keyValues[i] + ");";
                            code = code + "\nSystem.out.println(obj" + keyValues[i] + ");\n"

                            return code;
                        }
                    } else {
                        if (dataTypes[i + 1] === "Object Count") {
                            code = code + "JsonNode " + keyValues[i] + " = obj" + keyValues[i + 1] + ".get(\"" + keyValues[i] + "\");\n"

                        } else {
                            code = code + "JsonNode " + keyValues[i] + " = " + keyValues[i + 1] + ".get(\"" + keyValues[i] + "\");\n"

                        }
                    }

                } else {
                    if (i === keyValues.length - 2) {
                        code = code + "JsonNode " + keyValues[i] + " = rootNode.get(\"" + keyValues[i] + "\");\n"
                    } else {
                        if (dataTypes[i] === "Object Count") {
                            code = code + "JsonNode obj" + keyValues[i] + " = " + keyValues[i + 1] + ".get(" + keyValues[i] + ");\n"
                        } else {
                            if (dataTypes[i + 1] === "Object Count") {
                                code = code + "JsonNode " + keyValues[i] + " = obj" + keyValues[i + 1] + ".get(\"" + keyValues[i] + "\");\n"

                            } else {
                                code = code + "JsonNode " + keyValues[i] + " = " + keyValues[i + 1] + ".get(\"" + keyValues[i] + "\");\n"

                            }
                        }


                    }

                }
            } else {

            }
        }
        code = code + "\nSystem.out.println(" + keyValues[0] + ");\n"

        return code;
    }


    function gson(keyValues, dataTypes, jsonLoc) {
        let code;
        console.log("jsonloc "  +jsonLoc);
        if (jsonLoc === "File") {
            // From file
            code =  "byte[] jsonData = Files.readAllBytes(Paths.get(\"Enter DIR here\"));\n";
            code = code + "String jsonStr = new String(jsonData);\n";

            if (keyValues[keyValues.length - 1] === "{") {
                code = code + "JsonObject jsonObj = new Gson().fromJson(jsonStr, JsonObject.class);\n\n";
            } else {
                code = code + "JsonArray jsonObj = new Gson().fromJson(jsonStr, JsonArray.class);\n\n";
            }

        } else {
            // api code
            code = "URL url = new URL(\"" + jsonLoc +"\");\n";
            code = code + "URLConnection request = url.openConnection();\n";
            code = code + "request.connect();\n\n";

            code = code + "JsonElement root = new JsonParser().parse(new InputStreamReader((InputStream) request.getContent()));";
            if (keyValues[keyValues.length - 1] === "{") {
                code = code + "JsonObject jsonObj = root.getAsJsonObject();\n\n";
            } else {
                code = code + "JsonArray jsonObj = root.getAsJsonArray();\n\n";
            }
        }

        let numOfKeys = 0;
        for(let i = 0; i < dataTypes.length; i++){
            if(dataTypes[i] === "Key")
                numOfKeys++;
        }

        for (let i = keyValues.length - 1; i >= 0; i --) {
            if (i === keyValues.length - 1) {
                // if (keyValues[i] === "{") {
                //     code = code + "JsonObject jsonObj = new Gson().fromJson(jsonStr, JsonObject.class);\n\n";
                // } else if (keyValues[i] === "[") {
                //     code = code + "JsonArray jsonObj = new Gson().fromJson(jsonStr, JsonArray.class);\n\n";
                // }

            } else if (i === keyValues.length - 2) {
                if (dataTypes[i] === "Object") {
                    code = code + "JsonObject " + keyValues[i] + "Obj = (JsonObject) jsonObj.get(\"" + keyValues[i] + "\");\n";
                } else if (dataTypes[i] === "Array") {
                    code = code + "JsonArray " + keyValues[i] + "Obj = (JsonArray) jsonObj.get(\"" + keyValues[i] + "\");\n";
                } else if (dataTypes[i] === "Object Count") {
                    code = code + "JsonObject Obj" + keyValues[i] + " = (JsonObject) jsonObj.get(" + keyValues[i] + ");\n";

                }

                if (keyValues.length === 2 ||keyValues.length === 3) {
                    if (numOfKeys === 1) {
                        code = code + "String " + keyValues[i] + " = jsonObj.get(\"" + keyValues[i] + "\").toString();\n";
                    } else {
                        code = code + "String obj" + keyValues[i] + " = jsonObj.get(" + keyValues[i] + ").toString();\n";
                        code = code + "\nSystem.out.println(obj" + keyValues[i] + ");\n";
                        return code;
                    }
                }
            } else {
                if (dataTypes[i] === "Object") {
                    if (dataTypes[i + 1] === "Object Count") {
                        code = code + "JsonObject obj" + keyValues[i] + " = (JsonObject) " + keyValues[i + 1] + "Obj.get(\"" + keyValues[i] + "\");\n";
                    } else {
                        code = code + "JsonObject " + keyValues[i] + "Obj = (JsonObject) " + keyValues[i + 1] + "Obj.get(\"" + keyValues[i] + "\");\n";
                    }

                } else if (dataTypes[i] === "Array") {
                    code = code + "JsonArray " + keyValues[i] + "Obj = (JsonArray) " + keyValues[i + 1] + "Obj.get(\"" + keyValues[i] + "\");\n";
                } else if (dataTypes[i] === "Key") {
                    if (dataTypes[i + 1] === "Object Count") {
                        code = code + "String " + keyValues[i] + " = obj" + keyValues[i + 1] + ".get(\"" + keyValues[i] + "\").toString();\n";

                    } else {
                        if (numOfKeys === 1) {
                            code = code + "String " + keyValues[i] + " = " + keyValues[i + 1] + "Obj.get(\"" + keyValues[i] + "\").toString();\n";
                        } else {
                            code = code + "String obj" + keyValues[i] + " = " + keyValues[i + 1] + "Obj.get(\"" + keyValues[i] + "\").toString();\n";
                        }
                    }

                } else if (dataTypes[i] === "Object Count") {
                    code = code + "JsonObject obj" + keyValues[i] + " = (JsonObject) " + keyValues[i + 1] + "Obj.get(" + keyValues[i] + ");\n";
                }
            }
        }
        code = code + "\nSystem.out.println(" + keyValues[0] + ");\n";

        return code;
    }
};