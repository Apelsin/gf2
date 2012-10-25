#pragma strict

static function IOSmooth(a:float, b:float, c:float):float
{
    var x:float = Mathf.Lerp(a, b, Time.deltaTime * c);
    return Mathf.Clamp01(Mathf.Abs(x * 1.1) - 0.05) * Mathf.Sign(x); // Trimming;
}

static function G2Curve(x:float): float {
    return 1.0 / Mathf.Pow(2.7183, Mathf.Pow(x, 6.0));
}

function Start () {

}

function Update () {

}