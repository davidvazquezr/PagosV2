registrationModule.controller("loadingController", function($scope, $rootScope, alertFactory) {
     
    $scope.init = function() {
        console.log('Estoy en loginController');  
        $('#loader').hide();  
    };
    
});