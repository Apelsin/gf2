Shader "BadAss3 Shader" {
    Properties {
        _Color ("Main Color", Color) = (1,1,1,1)
        _MainTex ("Base (RGB)", 2D) = "white" {}
        _BumpMap ("Normalmap", 2D) = "bump" {}
        _RimColor ("Rim Color", Color) = (0.2,0.2,0.2,0.0)
        _RimPower ("Rim Width", Range(8.0, 0.5)) = 3.0 
        _Enhance ("Enhance", Range(0.0,5.0)) = 1.0
        _SpecColor ("Specular Color", Color) = (0.5, 0.5, 0.5, 1)
        _Shininess ("Hilite Width", Range (2.0, 0.01)) = 0.8
        _TimeScale ("Time Scaling", Range(0,10)) = 1.0
        _XAmount ("X Wiggle", Range(0,5)) = 1.0
        _YAmount ("Y Wiggle", Range(0,5)) = 1.0
    }
    SubShader 
    { 
        LOD 300
        Tags { "RenderType"="Opaque"}
        CGPROGRAM
        #pragma target 3.0
        #pragma surface surf BlinnPhong vertex:vert
        
        sampler2D _MainTex;
        sampler2D _BumpMap;
        fixed4 _Color;
        
        struct Input
        {
            float4 color : COLOR; 
            float3 viewDir;
            float2 uv_MainTex;
            float2 uv_BumpMap;
        };
        // This crap doesn't work?!
        //float PI          = 3.1415926535898;
        //float PI_BY_TWO   = 1.5707963267949;
        float4 _RimColor;
        float _RimPower; 
        half _Enhance;  
        half _Shininess;
        
        float _XAmount;
        float _YAmount;
        float _TimeScale;
        
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
        
        void vert(inout appdata_full v)
        {
            float time = _TimeScale * _Time.y;
            float iny = v.vertex.y * _YAmount + time;
            float wiggleX = sin(iny) * _XAmount;
            float wiggleY = cos(iny) * _YAmount;
            v.vertex.y = v.vertex.y + wiggleY;
            v.vertex.x = v.vertex.x + wiggleX;
            normalize(v.normal);
        }
        
        void surf (Input IN, inout SurfaceOutput o)
        { 
            fixed4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;
            o.Albedo = IN.color * c.rgb * 0.5;
            o.Alpha = c.a;
            o.Normal = UnpackNormal(tex2D(_BumpMap, IN.uv_BumpMap));
            half d = dot (normalize(IN.viewDir), o.Normal);
            d = acos(d) / 1.5707963267949;
            half rim = 1.0 - (d); 
            o.Emission = o.Albedo + _RimColor.rgb * pow (rim, _RimPower);
            o.Emission * 0.5;
            o.Albedo *= 1 + (rim * _Enhance) - _Enhance / 4.0;
            o.Gloss = 1.0;
            o.Specular = _Shininess;
        }
        ENDCG
    }
    FallBack "Reflective/VertexLit"
}