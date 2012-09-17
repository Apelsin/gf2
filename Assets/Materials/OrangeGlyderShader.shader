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
        #pragma surface surf BlinnPhong
        struct Input
        {
            float4 color : COLOR; 
            float3 viewDir;
        };
        float4 _RimColor;
        float _RimPower; 
        half _Enhance;  
        half _Shininess;
        void surf (Input IN, inout SurfaceOutput o)
        { 
            o.Albedo = IN.color;
            half rim = 1.0 - saturate(dot (normalize(IN.viewDir), o.Normal)); 
            o.Emission = _RimColor.rgb * pow (rim, _RimPower);
            o.Albedo *= 1 + (rim * _Enhance) - _Enhance / 8.0;  
            o.Gloss = 1.0;
            o.Specular = _Shininess;
        }
        ENDCG
    }
    FallBack "Reflective/VertexLit"
}