<template>
    <div>
        <v-btn class="mr-2" color="white" @click.stop="showDialog = true" text>
            Login
        </v-btn>
        <v-dialog v-model="showDialog" max-width="290">
            <v-card class="elevation-12">
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Login form</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-form v-model="loginValid">
                        <v-text-field
                            label="Username"
                            name="username"
                            prepend-icon="person"
                            type="text"
                        ></v-text-field>

                        <v-text-field
                            id="password"
                            label="Password"
                            name="password"
                            prepend-icon="lock"
                            type="password"
                        ></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click.stop="showDialog = false">Cancel</v-btn>
                    <v-btn text color="primary">Login</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data: () => ({
        loginValid: false,
        showDialog: false
    })
}
</script>
