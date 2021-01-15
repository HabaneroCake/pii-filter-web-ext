import { browser } from 'webextension-polyfill-ts';

export function get_fonts(): string
{ 
    let url = (u: string): string => {
        return browser.runtime.getURL(`assets/fonts/webfonts/${u}`);
    }
    return `
    @font-face {
        font-family: "Montserrat";
        font-weight: 100;
        font-style: normal;
        src: url("${url('Montserrat-Thin.woff2')}") format("woff2"),
             url("${url('Montserrat-Thin.woff')}") format("woff");
    }
    
    /** Montserrat Thin-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 100;
        font-style: italic;
        src: url("${url('Montserrat-ThinItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-ThinItalic.woff')}") format("woff");
    }
    
    /** Montserrat ExtraLight **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 200;
        font-style: normal;
        src: url("${url('Montserrat-ExtraLight.woff2')}") format("woff2"),
             url("${url('Montserrat-ExtraLight.woff')}") format("woff");
    }
    
    /** Montserrat ExtraLight-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 200;
        font-style: italic;
        src: url("${url('Montserrat-ExtraLightItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-ExtraLightItalic.woff')}") format("woff");
    }
    
    /** Montserrat Light **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 300;
        font-style: normal;
        src: url("${url('Montserrat-Light.woff2')}") format("woff2"),
             url("${url('Montserrat-Light.woff')}") format("woff");
    }
    
    /** Montserrat Light-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 300;
        font-style: italic;
        src: url("${url('Montserrat-LightItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-LightItalic.woff')}") format("woff");
    }
    
    /** Montserrat Regular **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 400;
        font-style: normal;
        src: url("${url('Montserrat-Regular.woff2')}") format("woff2"),
             url("${url('Montserrat-Regular.woff')}") format("woff");
    }
    
    /** Montserrat Regular-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 400;
        font-style: italic;
        src: url("${url('Montserrat-Italic.woff2')}") format("woff2"),
             url("${url('Montserrat-Italic.woff')}") format("woff");
    }
    
    /** Montserrat Medium **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 500;
        font-style: normal;
        src: url("${url('Montserrat-Medium.woff2')}") format("woff2"),
             url("${url('Montserrat-Medium.woff')}") format("woff");
    }
    
    /** Montserrat Medium-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 500;
        font-style: italic;
        src: url("${url('Montserrat-MediumItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-MediumItalic.woff')}") format("woff");
    }
    
    /** Montserrat SemiBold **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 600;
        font-style: normal;
        src: url("${url('Montserrat-SemiBold.woff2')}") format("woff2"),
             url("${url('Montserrat-SemiBold.woff')}") format("woff");
    }
    
    /** Montserrat SemiBold-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 600;
        font-style: italic;
        src: url("${url('Montserrat-SemiBoldItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-SemiBoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Bold **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 700;
        font-style: normal;
        src: url("${url('Montserrat-Bold.woff2')}") format("woff2"),
             url("${url('Montserrat-Bold.woff')}") format("woff");
    }
    
    /** Montserrat Bold-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 700;
        font-style: italic;
        src: url("${url('Montserrat-BoldItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-BoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat ExtraBold **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 800;
        font-style: normal;
        src: url("${url('Montserrat-ExtraBold.woff2')}") format("woff2"),
             url("${url('Montserrat-ExtraBold.woff')}") format("woff");
    }
    
    /** Montserrat ExtraBold-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 800;
        font-style: italic;
        src: url("${url('Montserrat-ExtraBoldItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-ExtraBoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Black **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 900;
        font-style: normal;
        src: url("${url('Montserrat-Black.woff2')}") format("woff2"),
             url("${url('Montserrat-Black.woff')}") format("woff");
    }
    
    /** Montserrat Black-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 900;
        font-style: italic;
        src: url("${url('Montserrat-BlackItalic.woff2')}") format("woff2"),
             url("${url('Montserrat-BlackItalic.woff')}") format("woff");
    }
    
    /** =================== MONTSERRAT ALTERNATES =================== **/
    
    /** Montserrat Alternates Thin **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 100;
        font-style: normal;
        src: url("${url('MontserratAlternates-Thin.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Thin.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Thin-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 100;
        font-style: italic;
        src: url("${url('MontserratAlternates-ThinItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ThinItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates ExtraLight **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 200;
        font-style: normal;
        src: url("${url('MontserratAlternates-ExtraLight.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ExtraLight.woff')}") format("woff");
    }
    
    /** Montserrat Alternates ExtraLight-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 200;
        font-style: italic;
        src: url("${url('MontserratAlternates-ExtraLightItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ExtraLightItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Light **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 300;
        font-style: normal;
        src: url("${url('MontserratAlternates-Light.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Light.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Light-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 300;
        font-style: italic;
        src: url("${url('MontserratAlternates-LightItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-LightItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Regular **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 400;
        font-style: normal;
        src: url("${url('MontserratAlternates-Regular.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Regular.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Regular-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 400;
        font-style: italic;
        src: url("${url('MontserratAlternates-Italic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Italic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Medium **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 500;
        font-style: normal;
        src: url("${url('MontserratAlternates-Medium.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Medium.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Medium-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 500;
        font-style: italic;
        src: url("${url('MontserratAlternates-MediumItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-MediumItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates SemiBold **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 600;
        font-style: normal;
        src: url("${url('MontserratAlternates-SemiBold.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-SemiBold.woff')}") format("woff");
    }
    
    /** Montserrat Alternates SemiBold-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 600;
        font-style: italic;
        src: url("${url('MontserratAlternates-SemiBoldItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-SemiBoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Bold **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 700;
        font-style: normal;
        src: url("${url('MontserratAlternates-Bold.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Bold.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Bold-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 700;
        font-style: italic;
        src: url("${url('MontserratAlternates-BoldItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-BoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates ExtraBold **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 800;
        font-style: normal;
        src: url("${url('MontserratAlternates-ExtraBold.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ExtraBold.woff')}") format("woff");
    }
    
    /** Montserrat Alternates ExtraBold-Italic **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 800;
        font-style: italic;
        src: url("${url('MontserratAlternates-ExtraBoldItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-ExtraBoldItalic.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Black **/
    @font-face {
        font-family: "Montserrat Alternates";
        font-weight: 900;
        font-style: normal;
        src: url("${url('MontserratAlternates-Black.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-Black.woff')}") format("woff");
    }
    
    /** Montserrat Alternates Black-Italic **/
    @font-face {
        font-family: "Montserrat";
        font-weight: 900;
        font-style: italic;
        src: url("${url('MontserratAlternates-BlackItalic.woff2')}") format("woff2"),
             url("${url('MontserratAlternates-BlackItalic.woff')}") format("woff");
    }`};