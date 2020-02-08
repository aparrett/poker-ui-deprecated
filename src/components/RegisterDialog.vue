<template>
    <div>
        <v-btn color="white" @click.stop="showDialog = true" text>
            Register
        </v-btn>
        <v-dialog v-model="showDialog" max-width="290">
            <v-card class="elevation-12">
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Registration form</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-form>
                        <v-text-field
                            label="Name"
                            name="name"
                            prepend-icon="person"
                            type="text"
                        ></v-text-field>
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
                    <v-btn text color="primary" @clock.stop="register"
                        >Register</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data: () => ({
        showDialog: false
    })
}
</script>
