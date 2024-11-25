<script>
    function onSignIn(googleUser ) {
        var profile = googleUser .getBasicProfile();
        console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());

        // You can also send the ID token to your server for verification
        var id_token = googleUser .getAuthResponse().id_token;
        console.log('ID Token: ' + id_token);
        
        // Here you can make an AJAX call to your backend to verify the token and log the user in
    }

    function signOut() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
            console.log('User  signed out.');
        });
    }
</script>