module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "plugin:vue/vue3-essential",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "plugins": [
        "vue"
    ],
    "rules": {
        "no-unused-vars": 0,
        "vue/no-unused-vars": 0,
        "vue/no-deprecated-slot-attribute": 0,
        "vue/no-deprecated-slot-scope-attribute": 0,
        "vue/no-deprecated-v-bind-sync": 0,
        "vue/no-deprecated-filter": 0,
    }
}
