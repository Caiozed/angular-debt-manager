// App configuration
var app = angular.module("debt-manager", ["ngRoute"]);

// Router configuration
app.config(function($routeProvider){
    $routeProvider
        .when("/", {
            templateUrl: "../templates/signup.html"
        })
        
        .when("/login", {
            templateUrl: "../templates/login.html"
        })
        
        .when("/edit/user", {
            templateUrl: "../templates/edit-user.html"
        })
        
        .when("/menu", {
            templateUrl: "../templates/menu.html",
            resolve: {
            init: function(){
                // Redirect to start page if user is not logged in
                    if(!isLoggedin()){
                        redirectTo("#!");
                    }
                }
            }
        })
        .when("/month/:id", {
            templateUrl: "../templates/month.html",
            resolve: {
            init: function(){
                 // Redirect to start page if user is not logged in
                    if(!isLoggedin()){
                        redirectTo("#!");
                    }
                }
            }
        });
});


// Angular global functions for templates
app.run(function($rootScope){
    // Format date to MM/YYYY
    $rootScope.formatDate = function(month){
        var splitMonth = month.split("-");
        return splitMonth[1]+"-"+splitMonth[0];
    };
    // Remove user data from sessionStorage
    $rootScope.logOut = function(){
        window.sessionStorage.clear();
        redirectTo("#!");
    };
    
    $rootScope.isLoggedin = function(){
        return isLoggedin();
    };
    
    $rootScope.currentUser = function(){
        return currentUser();
    };
});

// Signup page controller
app.controller("signup-ctrl", function($scope, $rootScope, $http){
    
    // Validates user input
    $scope.submitUser = function(username, password, password_confirmation){
        if(username != undefined && password == password_confirmation){
            $scope.addUser(username, password);
        }else{
            $scope.alert = "alert-danger"; 
            $scope.messages = "Senhas não são iguais!";
        }
    };
    
    // Add user to database
    $scope.addUser = function(username, password){
       request($http, "/new/users", "POST", {username: username, password: password},
            function(response){
                $scope.alert = "alert-success"; 
                $scope.messages = response.data[0];
                redirectTo("#!login");
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = response.data[0];
            }
       );
    };
});

// Edit user page controller
app.controller("edit-user-ctrl", function($scope, $rootScope, $http){
    
    // Add local variable username fot templates
    $scope.username = currentUser().username;
    
    // Validates user input
    $scope.submitUser = function(username, password, password_confirmation){
        if(username != undefined && password == password_confirmation){
            $scope.editUser(username, password);
        }else{
            $scope.alert = "alert-danger"; 
            $scope.messages = "Senhas não são iguais!";
        }
    };
    
    // Updates user on database 
    $scope.editUser = function(username, password){
       request($http, "/edit/users/"+currentUser().id, "POST", {username: username, password: password},
            function(response){
                $scope.alert = "alert-success"; 
                $scope.messages = response.data; //Send feedback to user
                $rootScope.logOut();
                redirectTo("#!login");
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = response.data[0];
            }
       );
    };
    
    // Delete user on database
    $rootScope.deleteUser = function(id){
        // Asks user if he is positive on deleting the data
        if(confirmationPopup("Tem certeza ? (Os dados nào podem ser recuperados)")){
            request($http, "/delete/users/"+currentUser().id, "POST", {},
                function(response){
                    $scope.alert = "alert-success"; 
                    $scope.messages = response.data;
                    $rootScope.logOut();
                    redirectTo("#!");
                },
                
                function(response){
                    $scope.alert = "alert-danger"; 
                    $scope.messages = response.data;
                }
           );
        }
    };
});

// Login page controller
app.controller("login-ctrl", function($scope, $rootScope, $http){
    // Get user data on database 
    $scope.login = function(username, password){
       request($http, "/login", "POST", {username: username, password: password},
            function(response){
                $scope.alert = "alert-success";
                if(response.data.length == 0){
                    $scope.alert = "alert-danger"; 
                    $scope.messages = "Usuário ou senha incorreta!";
                }else{
                    // Logs in the user if data is valid
                    var user_info = {id: response.data[0].id, username: response.data[0].username};
                    window.sessionStorage.setItem("user_info", JSON.stringify(user_info)); // Save user data on sessionStorage for later use
                    redirectTo("#!menu");
                }
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = "Usuário ou senha incorreta!";
            }
       );
    };
});

// Menu controller
app.controller("menu-ctrl", function($scope, $rootScope, $http){
    // Formats data to be used
    createYearMonth($scope);
    
    // Adds new month to database
    $scope.addMonth = function(month, year){
        var date = new Date(year+"-"+month+"-"+"01");
        var user_id = currentUser().id;
        request($http, "/new/months", "POST", {date: date, user_id: user_id},
            function(response){
                $scope.alert = "alert-success"; 
                $scope.messages = response.data;
                $scope.clearInputs();// Reset variables used on templates
                $scope.getMonths();// Refresh months display on page
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = response.data;
            }
        );
    };
    
    // Get months on database
    $scope.getMonths = function(){
        var user_id = currentUser().id;
        request($http, "/months", "POST", {user_id: user_id},
            function(response){
                $scope.alert = "alert-success"; 
                $scope.month_debts = response.data;
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = response.data;
            }
        );
    };
    
    //  Update months on database
    $scope.editMonth = function(id, month, year){
        var date = new Date(year+"-"+month+"-"+"01");
        request($http, "/edit/months/"+id, "POST", {date: date},
            function(response){
                $scope.alert = "alert-success"; 
                $scope.messages = response.data;
                $scope.clearInputs();
                $scope.getMonths();
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = response.data;
            }
        );
    };
    
    // Delete month on database upon popup confirmation
    $scope.deleteMonth = function(id){
        if(confirmationPopup("Tem certeza ? (todo as dividas serào apagadas)")){
            request($http, "/delete/months/"+id, "POST", {},
                function(response){
                    $scope.alert = "alert-success"; 
                    $scope.messages = response.data;
                    $scope.getMonths();
                },
                
                function(response){
                    $scope.alert = "alert-danger"; 
                    $scope.messages = response.data;
                }
            );
        }
    };
    
    // Set variable to be used by template
    $scope.setEditMonth = function(month_debts){
        $scope.month_debts_fomated = $rootScope.formatDate(month_debts.month_date);
        $scope.month = $scope.month_debts_fomated.split("-")[0];
        $scope.year = $scope.month_debts_fomated.split("-")[1];
        $scope.month_id = month_debts.id;
        $scope.editable = true;
    };
    
    // Clear variable used on template
    $scope.clearInputs =  function(){
        $scope.month_id = "";
        $scope.editable = false;
    };
    $scope.getMonths();
});

// Month controller
app.controller("month-ctrl", function($scope, $rootScope, $http, $routeParams){
    createYearMonth($scope);
    
    // Adds new debt to database 
    $scope.addDebt = function(description, due_date, price, paid){
        var month_id = $routeParams.id;
        // If checkmark on page is not checked paid need to be set to false
        if(paid == undefined){
            paid = false;
        }
        request($http, "/new/debts", "POST", 
            {description: description, due_date: due_date, price: price, paid: paid, month_id: month_id},
            function(response){
                $scope.alert = "alert-success"; 
                $scope.messages = response.data;
                $scope.getDebts();
                $scope.clearInputs();
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = response.data;
            }
        );
    };
    
    $scope.getDebts = function(){
        $scope.total = 0;
        $scope.editable = false;
        var month_id = $routeParams.id;
        request($http, "/debts", "POST", {month_id: month_id},
            function(response){
                $scope.alert = "alert-success"; 
                $scope.debts = response.data;
                console.log($scope.debts);
                // Calculates the total debt to be paid 
                angular.forEach($scope.debts, function(debt, key) {
                    $scope.total += debt.price;
                });
                
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = response.data;
            }
        );
    };
    
    // Edit singular debt on database
    $scope.editDebt = function(id, description, due_date, price, paid){
        if(paid == undefined){
            paid = false;
        }
        request($http, "/edit/debts/"+id, "POST", 
            {description: description, due_date: due_date, price: price, paid: paid},
            function(response){
                $scope.alert = "alert-success"; 
                $scope.messages = response.data;
                $scope.getDebts();
                $scope.clearInputs();
            },
            
            function(response){
                $scope.alert = "alert-danger"; 
                $scope.messages = response.data;
            }
        );
    };
    
    // Delete debt on database
    $scope.deleteDebt = function(id){
        if(confirmationPopup("Tem certeza ?")){
            request($http, "/delete/debts/"+id, "POST", {},
                function(response){
                    $scope.alert = "alert-success"; 
                    $scope.messages = response.data;
                    $scope.getDebts();
                },
                
                function(response){
                    $scope.alert = "alert-danger"; 
                    $scope.messages = response.data;
                }
            );
        }
    };
    
    // Set variables to be used on template 
    $scope.setEditDebt = function(debt){
        $scope.debt_id = debt.id;
        $scope.description = debt.description;
        $scope.due_date = new Date(debt.due_date);
        $scope.price = debt.price;
        $scope.paid = debt.paid == 1 ? true : false;
        $scope.editable = true;
    };
    
    // Reset variables used on template 
    $scope.clearInputs =  function(){
        $scope.debt_id = "";
        $scope.description = "";
        $scope.due_date = "";
        $scope.price = "";
        $scope.paid = "";
        $scope.editable = false;
    };
    
    $scope.orderByData = function(data){
        $scope.order = data;
    };
    
    $scope.getDebts();
});



// Global functions

// Makes ajax request to beckend 
function request($http, url, method, data, successCallback, errorCallback){
     $http({
            url: url,
            method: method, 
            data: data
        }).then(function(response){
            successCallback(response);
        },  function(response){
            errorCallback(response);
        });
}

// Redirect to a string 
function redirectTo(path){
    window.location = path;
}

// Returns the current logged user if one exists
function currentUser (){
   return JSON.parse(window.sessionStorage.getItem("user_info"));
}

// Return true if there is a user logged, returns false otherwise
function isLoggedin(){
    if(currentUser()){
        return true;
    }else{
        return false;
    }
}


// Create data to be used on select tag of a template
function createYearMonth($scope){
    $scope.years = [];
    $scope.months = [];
    for (var i = 1; i <= 12; i++) {
        $scope.months.push(i);
    }
    
    for (var i = 2017; i < 2080; i++) {
        $scope.years.push(i);
    }
}


// Display a confirmation message and returns true if the user select yes
function confirmationPopup(msg){
    return confirm(msg);
}