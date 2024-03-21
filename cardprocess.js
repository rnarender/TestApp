        String.prototype.toCardFormat = function () {
            return this.replace(/[^0-9]/g, "").substr(0, 19).split("").reduce(cardFormat, "");
            function cardFormat(str, l, i) {
                return str + ((!i || (i % 4)) ? "" : " ") + l;
            }
        };
        function cardNumberKeyPress() {
            getCreditCardType();
        }

        function getCreditCardType() {
            $('#cardNumber').validateCreditCard(function (result) {
                if (result.card_type && result.card_type.name) {
                    switch (result.card_type.name) {
                        case 'visa':
                            $('#cardType').text('Visa');
                            break;
                        case 'mastercard':
                            $('#cardType').text('Master Card');
                            break;
                        case 'amex':
                            $('#cardType').text('American Express');
                            break;
                        case 'maestro':
                            $('#cardType').text('Maestro');
                            break;
                        case 'discover':
                            $('#cardType').text('Discover');
                            break;
                        case 'diners_club_carte_blanche':
                            $('#cardType').text('Diners Club');
                            break;
                        case 'uatp':
                            $('#cardType').text('Uatp');
                            break;
                        default: $('#cardType').text(result.card_type.name);
                            break;
                    }
                }
                else {
                    $('#cardType').text("");
                }
            });
        }


        $(document).ready(function () {
            var country = $("#selectedCountry").val();
            if(country != "" && country != undefined)
                $("#billingCountry").val(country);

            $("#cardNumber").keyup(function () {
                $(this).val($(this).val().toCardFormat());
            });
            $("#cardNumber").blur(function () {
                getCreditCardType();
            });
            function generateMonthOptions() {
                var selectMonth = $('.monthSelection');
                for (var monthNum = 1; monthNum <= 12; monthNum++) {
                    var option = $('<option>').val(monthNum.toString().padStart(2, '0')).text(monthNum.toString().padStart(2, '0'));
                    selectMonth.append(option);
                }
            }

            // Function to start rotating the spinner
            function rotateSpinner() {
                document.getElementById("saveButton").disabled = true; // Disable the save button               
                document.getElementById("spinner").style.display = "block";  // show the spinner

                // Start rotating the spinner
                var angle = 0;
                var spinnerInterval = setInterval(function () {
                    angle += 6;
                    document.getElementById("spinner").style.transform = "rotate(" + angle + "deg)";
                }, 50); // Adjust the rotation speed as needed
            }

            // Function to stop rotating the spinner
            function stopRotateSpinner() {
                document.getElementById("saveButton").disabled = false; // Enable the save button
                var spinner = document.getElementById("spinner");
                spinner.style.animation = "none";
            }

            function generateYearOptions() {
                var currentYear = new Date().getFullYear();
                var selectYear = $('.yearSelection');
                for (var i = currentYear; i <= currentYear + 5; i++) {
                    var option = $('<option>').val(i).text(i);
                    selectYear.append(option);
                }
            }

            function isValidExpirationDate(month, year) {
                var currentYear = new Date().getFullYear();
                var currentMonth = new Date().getMonth() + 1;


                var expYear = parseInt(year, 10);
                var expMonth = parseInt(month, 10);


                if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                    return false;
                }
                return true;
            }

            generateMonthOptions();
            generateYearOptions();

            $("#saveButton").click(function () {
                var accountType = $("#AccountType").val();
                if (accountType == 'cc'){
                    if(validateCardForm())
                        processCreditCardData();
                }
                else if(accountType == 'ach'){
                    if(validateAchForm())
                        processAchData();
                }
            });

            function validRoutingNumber(routing) {
                if (routing.length !== 9) {
                    return false;
                }
              
                var checksumTotal = (3 * (parseInt(routing.charAt(0), 10) + parseInt(routing.charAt(3), 10) + parseInt(routing.charAt(6), 10))) + 
                                    (7 * (parseInt(routing.charAt(1), 10) + parseInt(routing.charAt(4), 10) + parseInt(routing.charAt(7), 10))) + 
                                    (1 * (parseInt(routing.charAt(2), 10) + parseInt(routing.charAt(5), 10) + parseInt(routing.charAt(8), 10)));

                var checksumMod = checksumTotal % 10;
                if (checksumMod !== 0) {
                    return false;
                }
                else {
                    return true;
                }
            }
            function validateCardForm() {
                var cardNumber = $("#cardNumber").val().replaceAll(' ', '');;
                var expireMonth = $('#expireMonth').find(":selected").val();
                var expireYear = $('#expireYear').find(":selected").val();
                var cvv = $("#cvv").val();
                var billingName = $("#billingName").val();
                var billingEmail = $("#billingEmail").val();
                var billingAddress = $("#billingAddress").val();
                var billingCity = $("#billingCity").val();
                var billingState = $("#billingState").val();
                var billingZipCode = $("#billingZipCode").val();
                var billingCountry = $('#billingCountry').find(":selected").val();
                var expirationMonth = $('.monthSelection').val();
                var expirationYear = $('.yearSelection').val();

                // Reset validation styles
                var inputs = document.querySelectorAll('input, select');
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].classList.remove('is-invalid');
                }
                $('#expireMonth').removeClass('is-invalid');

                // Validate Card Number
                //if (!/^\d$/.test(cardNumber)) {
                //    $("#cardNumber").addClass('is-invalid');
                //    return false;
                //}
                
                var isValidCreditCard = false;
                $('#cardNumber').validateCreditCard(function (result) {
                    if (result.valid) {
                        isValidCreditCard = true
                    }
                });
                if (!isValidCreditCard) {
                    $("#cardNumber").addClass('is-invalid');
                    event.preventDefault();
                    return false;
                }
                if (!isValidExpirationDate(expirationMonth, expirationYear)) {
                    $('#expireMonth').addClass('is-invalid');
                    event.preventDefault();
                    return false;
                }
                // Validate CVV
                if (!/^\d{3,5}$/.test($("#cvv").val())) {
                    $("#cvv").addClass('is-invalid');
                    return false;
                }
                // Validate Name (should contain only alphabets)
                if (!/^[A-Za-z\s]+$/.test($("#billingName").val())) {
                    $("#billingName").addClass('is-invalid');
                    return false;
                }

                // Validate Email
                if (!/^\S+\S+\.\S+$/.test($("#billingEmail").val())) {
                    $("#billingEmail").addClass('is-invalid');
                    return false;
                }
                if (/^\w+([\.-]?\w+)*\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#billingEmail").val())) {
                    $("#billingEmail").addClass('is-invalid');
                    return false;
                }

                // Validate Address
                if ($("#billingAddress").val().trim() === '') {
                    $("#billingAddress").addClass('is-invalid');
                    return false;
                }
                // Validate City
                if ($("#billingCity").val().trim() === '') {
                    $("#billingCity").addClass('is-invalid');
                    return false;
                }
                // Validate State
                if ($("#billingState").val().trim() === '') {
                    $("#billingState").addClass('is-invalid');;
                    return false;
                }
                // Validate Zipcode
                if ($("#billingZipCode").val().trim() === '') {
                    $("#billingZipCode").addClass('is-invalid');
                    return false;
                }
                return true;
            }
            function validateAchForm() {
                // Reset validation styles
                var inputs = document.querySelectorAll('input, select');
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].classList.remove('is-invalid');
                }

                // Validate Ach Account Number
                if ($("#accountNumber").val().trim() === '') {
                    $("#accountNumber").addClass('is-invalid');
                    return false;
                }
                // Validate Ach Routing Number
                if ($("#routingNumber").val().trim() === '') {
                    $("#routingNumber").addClass('is-invalid');
                    return false;
                }
                // Validate Ach Routing Number
                if(validRoutingNumber($("#routingNumber").val()) === false){
                    $("#routingNumber").addClass('is-invalid');
                    return false;
                }

                // Validate Ach Account Type
                if ($("#accountType").val().trim() === '') {
                    $("#accountType").addClass('is-invalid');
                    return false;
                }
                // Validate Name (should contain only alphabets)
                if (!/^[A-Za-z\s]+$/.test($("#billingName").val())) {
                    $("#billingName").addClass('is-invalid');
                    return false;
                }
                // Validate Email
                if (!/^\S+\S+\.\S+$/.test($("#billingEmail").val())) {
                    $("#billingEmail").addClass('is-invalid');
                    return false;
                }
                if (/^\w+([\.-]?\w+)*\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($("#billingEmail").val())) {
                    $("#billingEmail").addClass('is-invalid');
                    return false;
                }
                // Validate Address
                if ($("#billingAddress").val().trim() === '') {
                    $("#billingAddress").addClass('is-invalid');
                    return false;
                }
                // Validate City
                if ($("#billingCity").val().trim() === '') {
                    $("#billingCity").addClass('is-invalid');
                    return false;
                }
                // Validate State
                if ($("#billingState").val().trim() === '') {
                    $("#billingState").addClass('is-invalid');;
                    return false;
                }
                // Validate Zipcode
                if ($("#billingZipCode").val().trim() === '') {
                    $("#billingZipCode").addClass('is-invalid');
                    return false;
                }
                return true;
            }

            function processCreditCardData() {
                debugger;
                var hosturl = $("#hosetBaseUrl").val();
                rotateSpinner();
                var headersInfo = JSON.parse(decodeURIComponent($("#headersInfo").val()));
                $.ajax({
                    url: hosturl +"/api/Card/RetrievePublicKey",
                    headers: headersInfo,
                    type: "GET",
                    contentType: "application/json",
                    success: function (response) {
                        var publicKey = response.publicKey;
                        var cardNumber = $("#cardNumber").val();
                        var expireMonth = $('#expireMonth').find(":selected").val();
                        var expireYear = $('#expireYear').find(":selected").val();
                        var cvv = $("#cvv").val();
                        var billingName = $("#billingName").val();
                        var billingEmail = $("#billingEmail").val();
                        var billingAddress = $("#billingAddress").val();
                        var billingCity = $("#billingCity").val();
                        var billingState = $("#billingState").val();
                        var billingZipCode = $("#billingZipCode").val();
                        var billingCountry = $('#billingCountry').find(":selected").val();
                        var cardType = $("#cardType").text();
                        var headersInfo = JSON.parse(decodeURIComponent($("#headersInfo").val()));
                        var createProfileValue = $("#createProfile").val();
                        let boolValue = (createProfileValue === "true");
                        var accountType = $("#AccountType").val();
                        var locationID = $("#LocationID").val();
                        var profileId = $("#ProfileId").val();
                        var accountId = $("#AccountId").val();
                        
                        var CardModel = {
                            CardType : cardType,
                            ExpiryMonth: expireMonth,
                            ExpiryYear: expireYear,
                            CVV: cvv,
                            BillingInfoModel: {
                                Name: billingName,
                                EmailAddress: billingEmail,
                                Address: billingAddress,
                                City: billingCity,
                                State: billingState,
                                Zip: billingZipCode,
                                Country: billingCountry,
                                CreateProfile: boolValue,
                                AccountType: accountType,
                                LocationID: locationID,
                                ProfileId: profileId,
                                AccountId: accountId
                            }
                        };
                        encrypt(cardNumber, publicKey).then((encryptedData) => {
                            var CreditCardData = {
                                Card: encryptedData,
                                CardModel: CardModel
                            }
                            $.ajax({
                                url: hosturl+"/api/Card/SaveCreditCardAndCreateToken",
                                headers: headersInfo,
                                type: "POST",
                                data: JSON.stringify(CreditCardData),
                                contentType: "application/json",
                                success: function (response) {
                                    stopRotateSpinner();                                    
                                    console.log("Token Generated and Received Data", response);
                                    window.opener.postMessage(response, '*');
                                    window.open('', '_self').close()
                                },
                                error: function (error) {
                                    console.log(error);
                                    var LogRequest={
                                        Message: 'AddCardFormWithBillingInfo.processCardData() ::' + error.responseText,
                                        JsonObject: JSON.stringify(error)
                                    }
                                    $.ajax({
                                        url: hosturl +"/api/Log/Error",
                                        headers: headersInfo,
                                        type: "POST",
                                        data: JSON.stringify(LogRequest),
                                        contentType: "application/json",
                                        success: function (response) {
                                            console.log("Error loged on server");
                                        },
                                        error: function (error) {
                                            console.log(error);
                                        }
                                    });
                                    stopRotateSpinner();
                                    window.opener.postMessage(error.responseJSON, '*');
                                    window.open('', '_self').close()
                                }
                            });
                        })
                    },
                    error: function (xhr, status, error) {
                        console.log(error);
                        stopRotateSpinner();
                    }
                });
            }
            function processAchData() {
                var hosturl = $("#hosetBaseUrl").val();
                rotateSpinner();
                var headersInfo = JSON.parse(decodeURIComponent($("#headersInfo").val()));
                var billingName = $("#billingName").val();
                var billingEmail = $("#billingEmail").val();
                var billingAddress = $("#billingAddress").val();
                var billingCity = $("#billingCity").val();
                var billingState = $("#billingState").val();
                var billingZipCode = $("#billingZipCode").val();
                var billingCountry = $('#billingCountry').find(":selected").val();
                var createProfileValue = $("#createProfile").val();
                let boolValue = (createProfileValue === "true");
                var type = $("#AccountType").val();
                var locationID = $("#LocationID").val();
                var achAccountNumber = $("#accountNumber").val();
                var achRoutingNumber = $("#routingNumber").val();
                var achAccountType = $('#accountType').find(":selected").val();
                var profileId = $("#ProfileId").val();
                var accountId = $("#AccountId").val();
                var AchAccountData = {
                            AchAccount: {
                                        CreateProfile: boolValue,
                                        Type: type,
                                        LocationID: locationID,
                                        AchAccountNumber: achAccountNumber,
                                        AchRoutingNumber: achRoutingNumber,
                                        AchAccountType: achAccountType,
                                        ProfileId: profileId,
                                        AccountId: accountId
                                    },
                            AchBilling: {
                                        Name: billingName,
                                        EmailAddress: billingEmail,
                                        Address: billingAddress,
                                        City: billingCity,
                                        State: billingState,
                                        Zip: billingZipCode,
                                        Country: billingCountry
                                    }
                        };
                console.log('AchAccountData', AchAccountData);
                  $.ajax({
                      url: hosturl +"/api/Card/SaveACHandCreateToken",
                    headers: headersInfo,
                    type: "POST",
                    data: JSON.stringify(AchAccountData),
                    contentType: "application/json",
                    success: function (response) {
                        stopRotateSpinner();
                        console.log("Token Generated and Received Data", response);
                        window.opener.postMessage(response, '*');
                        window.open('', '_self').close()
                    },
                    error: function (error) {
                        console.log(error);
                        var LogRequest = {
                            Message: 'AddACHWithBillingInfo.processAchData() ::' + error.responseText,
                            JsonObject: JSON.stringify(error)
                        }
                        $.ajax({
                            url: hosturl +"/api/Log/Error",
                            headers: headersInfo,
                            type: "POST",
                            data: JSON.stringify(LogRequest),
                            contentType: "application/json",
                            success: function (response) {
                                console.log("Error loged on server");
                            },
                            error: function (error) {
                                console.log(error);
                            }
                        });
                        stopRotateSpinner();
                        window.opener.postMessage(error.responseJSON, '*');
                        window.open('', '_self').close()
                    }
                });
            }

            async function encrypt(plaintext, publicKey) {
                const pub = await importPublicKey(publicKey);
                const encrypted = await encryptRSA(pub, new TextEncoder().encode(plaintext));
                const encryptedBase64 = window.btoa(ab2str(encrypted));
                console.log(encryptedBase64);
                return encryptedBase64;
            }

            function getSpkiDer(spkiPem) {
                const pemHeader = "-----BEGIN PUBLIC KEY-----";
                const pemFooter = "-----END PUBLIC KEY-------";
                var pemContents = spkiPem.substring(
                    pemHeader.length,
                    spkiPem.length - pemFooter.length
                );

                var binaryDerString = window.atob(pemContents);
                return str2ab(binaryDerString);
            }

            function importPublicKey(spkiPem) {
                return window.crypto.subtle.importKey(
                    "spki",
                    getSpkiDer(spkiPem),
                    {
                        name: "RSA-OAEP",
                        hash: "SHA-256",
                    },
                    true,
                    ["encrypt"]
                );
            }

            function encryptRSA(key, plaintext) {
                let encrypted = window.crypto.subtle.encrypt(
                    {
                        name: "RSA-OAEP",
                    },
                    key,
                    plaintext
                );
                return encrypted;
            }

            function str2ab(str) {
                const buf = new ArrayBuffer(str.length);
                const bufView = new Uint8Array(buf);
                for (let i = 0, strLen = str.length; i < strLen; i++) {
                    bufView[i] = str.charCodeAt(i);
                }
                return buf;
            }

            function ab2str(buf) {
                return String.fromCharCode.apply(null, new Uint8Array(buf));
            }

        });
