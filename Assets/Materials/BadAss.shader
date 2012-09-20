Shader "Custom/OrangeGlyderShader" {
    Properties {
        _RimColor ("Rim Color", Color) = (0.2,0.2,0.2,0.0)
        _RimPower ("Rim Width", Range(8.0, 0.5)) = 3.0 
        _Enhance ("Enhance", Range(0.0,5.0)) = 1.0
        _SpecColor ("Specular Color", Color) = (0.5, 0.5, 0.5, 1)
        _Shininess ("Hilite Width", Range (2.0, 0.01)) = 0.8
    }
    SubShader 
    { 
        LOD 300
        Tags { "RenderType"="Opaque"}
        CGPROGRAM
        #pragma target 3.0
        #pragma surface surf BlinnPhong
        struct Input
        {
            float4 color : COLOR; 
            float3 viewDir;
        };
        // This crap doesn't work?!
        //float PI          = 3.1415926535898;
        //float PI_BY_TWO   = 1.5707963267949;
        float4 _RimColor;
        float _RimPower; 
        half _Enhance;  
        half _Shininess;
        float smoothstep(float edge0, float edge1, float x)
        {
            // Scale, bias and saturate x to 0..1 range
            x = saturate((x - edge0)/(edge1 - edge0)); 
            // Evaluate polynomial
            return pow(x, 2.0)*(3 - 2*x);
        }
        // Smoothstep approximated inverse:
        float smoothstep_a_i(float x)
        {
            x = saturate(x);
            return x > 0.5 ? 1.0 - sqrt((1.0 - x) / 2.0) : sqrt(x / 2.0);
        }
        void surf (Input IN, inout SurfaceOutput o)
        { 
            o.Albedo = IN.color;
            half d = dot (normalize(IN.viewDir), o.Normal);
            d = acos(d) / 1.5707963267949;
            half rim = 1.0 - (d); 
            o.Emission = _RimColor.rgb * pow (rim, _RimPower);
            o.Albedo *= 1 + (rim * _Enhance) - _Enhance / 4.0;
            o.Gloss = 1.0;
            o.Specular = _Shininess;
        }
        ENDCG
    }
    FallBack "Reflective/VertexLit"
}