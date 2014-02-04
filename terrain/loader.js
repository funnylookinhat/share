 NS.ModuleManager.load= function(file, onload, onerror) {
        var node= document.createElement("script");
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        if ( onload ) {
            node.addEventListener('load', onload, false);
        }
        if ( onerror ) {
            node.addEventListener('error', onerror, false);
        }

        node.addEventListener("load", function( ) {
            mm.solveAll();
        }, false);

        node.src = file+(!DEBUG ? "?"+(new Date().getTime()) : "");

        document.getElementsByTagName('head')[0].appendChild( node );

        // maybe this file has all the modules needed so no more file loading/module resolution must be performed.

    }