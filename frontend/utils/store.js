const store = new Vuex.Store({
    state : {
        authen_token : null,
        role : null,
        logged_In_ : false,
        userID : null,
    },
    mutations : {
        setUser(state) {
            try{
             if (JSON.parse(localStorage.getItem('user'))){
                const user = JSON.parse(localStorage.getItem('user'));
                state.authen_token = user.token;
                state.role = user.role;
                state.logged_In_ = true;
                state.userID = user.id;
             }
            } catch {
                console.warn('You are not logged in')
        }         
        },

        logOut(state){
            state.authen_token = null;
            state.role = null;
            state.logged_In_ = false;
            state.userID = null;

            localStorage.removeItem('user')
        }
    }
})

window.store = store;

store.commit('setUser') // this line is so that setUser runs even after a refresh (when this page gets loaded) - this is done because otherwise every time a refresh happens, vuex clears everything in state 

export default store;