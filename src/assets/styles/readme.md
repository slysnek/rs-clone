Main.css moves into this folder after compiling
so other scss files also need to be here due to the way
webpack handles files' imports (right now url option of css-loader is false)
so it won't create other files
