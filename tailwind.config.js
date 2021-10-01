module.exports = {
    purge: [
        './**/*.html',
        './**/*.tsx',
    ],
    theme: {
        container: {
            center: true,
            padding: "1rem",
        },
    },
    variants: {
        extend: {
            backgroundColor: ['disabled'],
        }
    },
    plugins: [],
}
