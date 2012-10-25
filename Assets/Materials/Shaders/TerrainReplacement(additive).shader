/* Code provided by Chris Morris of Six Times Nothing (http://www.sixtimesnothing.com) */
/* Free to use and modify  */

Shader "Hidden/TerrainEngine/Splatmap/Lightmap-FirstPass" {
Properties {
	_Control ("Control (RGBA)", 2D) = "red" {}
	_Splat3 ("Layer 3 (A)", 2D) = "white" {}
	_Splat2 ("Layer 2 (B)", 2D) = "white" {}
	_Splat1 ("Layer 1 (G)", 2D) = "white" {}
	_Splat0 ("Layer 0 (R)", 2D) = "white" {}

	// used in fallback on old cards
	_MainTex ("BaseMap (RGB)", 2D) = "white" {}
	_Color ("Main Color", Color) = (1,1,1,1)
	
	_SpecColor ("Specular Color", Color) = (0.5, 0.5, 0.5, 1)
}

SubShader {

	Tags {
		"SplatCount" = "4"
		"Queue" = "Geometry-100"
		"RenderType" = "Opaque"
	}
	
CGPROGRAM
#pragma surface surf BlinnPhong vertex:vert
#pragma target 3.0
#include "UnityCG.cginc"

struct Input {
	float3 eye;
	float2 uv_Control : TEXCOORD0;
	float2 uv_Splat0 : TEXCOORD1;
	float2 uv_Splat1 : TEXCOORD2;
	float2 uv_Splat2 : TEXCOORD3;
	float2 uv_Splat3 : TEXCOORD4;
};

// Supply the shader with tangents for the terrain
void vert (inout appdata_full v, out Input o) {

	float4 pos = float4(v.vertex.xyz, 1.0);
	
	float3x3 world2Tangent;
	
	float3x3 normalMatrix;
	normalMatrix[0] = UNITY_MATRIX_MV[0];
	normalMatrix[0] = UNITY_MATRIX_MV[0];
	normalMatrix[1] = UNITY_MATRIX_MV[1];
	normalMatrix[2] = UNITY_MATRIX_MV[2];
	
	float3 N = v.normal;
	float3 T = float3(1,0,0) - N * dot(N, float3(1,0,0));
	
	v.tangent.xyz =T;

	float tangentDir = dot(cross(N, float3(-1,0,0)), float3(0,0,1));
	if(tangentDir <= 0)
		v.tangent.w = -1;
	else
		v.tangent.w = 1;

	float3 B = cross(T, N) * v.tangent.w;
	
	N = normalize(mul(normalMatrix, N));
	T = normalize(mul(normalMatrix, T));
	B = normalize(mul(normalMatrix, B));

	world2Tangent = float3x3(T, B, N);
	
	// send tangent space view
	// view space vertex
	float3 vpos = mul(UNITY_MATRIX_MV, pos).xyz;
	o.eye.xyz = mul(world2Tangent, vpos.xyz);
}

sampler2D _Control;

sampler2D _BumpMap0, _BumpMap1, _BumpMap2, _BumpMap3;
sampler2D _parallax0, _parallax1, _parallax2, _parallax3;
sampler2D _Splat0,_Splat1,_Splat2,_Splat3, _SplatA, _SplatB, _SplatC, _SplatD;
float _Spec0, _Spec1, _Spec2, _Spec3, _Tile0, _Tile1, _Tile2, _Tile3, _TerrainX, _TerrainZ;

float parallaxDepth;

void surf (Input IN, inout SurfaceOutput o) {
	
	half4 splat_control = tex2D (_Control, IN.uv_Control);
	half3 col;
	
	// Parallax
	float3 p, v;
	const int cone_steps = 5;
	const int binary_steps = 7;
	float db;
	float3 p0;
	float dist;
	float4 tex;
	float height;
	float cone_ratio;
	v = normalize(IN.eye.xyz);
	v.z = abs(v.z);
	db = 1.0-v.z; db*=db; db*=db; db=1.0-db*db;
	v.xy *= db;
	v.xy *= parallaxDepth;
	v /= v.z;
	dist = length(v.xy);
	float3 revertV = v;
	
				// parallax 0
				p = float3(IN.uv_Control.x * (_TerrainX/_Tile0), IN.uv_Control.y * (_TerrainZ/_Tile0), 0);
				p0 = p;

				for( int i=0;i<cone_steps;i++ )
				{
					tex = tex2D(_parallax0, p.xy);

					height = saturate(tex.w - p.z);
					
					cone_ratio = tex.z;
					
					p += v * (cone_ratio * height / (dist + cone_ratio));
				}

				v *= p.z*0.5;
				p = p0 + v;

				for( int i=0;i<binary_steps;i++ )
				{
					tex = tex2D(_parallax0, p.xy);
					v *= 0.5;
					if (p.z<tex.w)
						p+=v;
					else
						p-=v;
				}
				
				// 4 splats, normals, and specular settings
				col  = splat_control.r * tex2D (_SplatA, p.xy).rgb;	
				o.Normal = splat_control.r * UnpackNormal(tex2D(_BumpMap0, p.xy));
				o.Gloss = splat_control.r * _Spec0;
				o.Specular = splat_control.r * _Spec0;
				
				// Parallax 1
				p = float3(IN.uv_Control.x * (_TerrainX/_Tile1), IN.uv_Control.y * (_TerrainZ/_Tile1), 0);
				p0 = p;
				v = revertV;
				
				for( int i=0;i<cone_steps;i++ )
				{
					tex = tex2D(_parallax1, p.xy);

					height = saturate(tex.w - p.z);
					
					cone_ratio = tex.z;
					
					p += v * (cone_ratio * height / (dist + cone_ratio));
				}

				v *= p.z*0.5;
				p = p0 + v;

				for( int i=0;i<binary_steps;i++ )
				{
					tex = tex2D(_parallax1, p.xy);
					v *= 0.5;
					if (p.z<tex.w)
						p+=v;
					else
						p-=v;
				}

				// 4 splats, normals, and specular settings
				col  += splat_control.g * tex2D (_SplatB, p.xy).rgb;	
				o.Normal += splat_control.g * UnpackNormal(tex2D(_BumpMap1, p.xy));
				o.Gloss += splat_control.g * _Spec1;
				o.Specular += splat_control.g * _Spec1;
				
				
				// Parallax 2
				p = float3(IN.uv_Control.x * (_TerrainX/_Tile2), IN.uv_Control.y * (_TerrainZ/_Tile2), 0);
				p0 = p;
				v = revertV;
				
				for( int i=0;i<cone_steps;i++ )
				{
					tex = tex2D(_parallax2, p.xy);

					height = saturate(tex.w - p.z);
					
					cone_ratio = tex.z;
					
					p += v * (cone_ratio * height / (dist + cone_ratio));
				}

				v *= p.z*0.5;
				p = p0 + v;

				for( int i=0;i<binary_steps;i++ )
				{
					tex = tex2D(_parallax2, p.xy);
					v *= 0.5;
					if (p.z<tex.w)
						p+=v;
					else
						p-=v;
				}

				// 4 splats, normals, and specular settings
				col  += splat_control.b * tex2D (_SplatC, p.xy).rgb;	
				o.Normal += splat_control.b * UnpackNormal(tex2D(_BumpMap2, p.xy));
				o.Gloss += splat_control.b * _Spec2;
				o.Specular += splat_control.b * _Spec2;
				
				
				// Parallax 3
				p = float3(IN.uv_Control.x * (_TerrainX/_Tile3), IN.uv_Control.y * (_TerrainZ/_Tile3), 0);
				p0 = p;
				
				v = revertV;
				
				for( int i=0;i<cone_steps;i++ )
				{
					tex = tex2D(_parallax3, p.xy);

					height = saturate(tex.w - p.z);
					
					cone_ratio = tex.z;
					
					p += v * (cone_ratio * height / (dist + cone_ratio));
				}

				v *= p.z*0.5;
				p = p0 + v;

				for( int i=0;i<binary_steps;i++ )
				{
					tex = tex2D(_parallax3, p.xy);
					v *= 0.5;
					if (p.z<tex.w)
						p+=v;
					else
						p-=v;
				}

				// 4 splats, normals, and specular settings
				col += splat_control.a * tex2D (_SplatD, p.xy).rgb;	
				o.Normal += splat_control.a * UnpackNormal(tex2D(_BumpMap3, p.xy));
				o.Gloss += splat_control.a * _Spec3;
				o.Specular += splat_control.a * _Spec3;
				
	o.Albedo = col;
}
ENDCG  
}

// Fallback to Diffuse
Fallback "Diffuse"
}