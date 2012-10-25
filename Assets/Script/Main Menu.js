function OnGUI ()
{
    var a = Screen.width * 0.5;
    var b = Screen.height * 0.5;
    GUI.Box (Rect (a - 100, b - 100, 200, 200), "Welcome to GF2: Faster Still.");
    
    if (GUI.Button (Rect (a - 80, b - 80, 160, 20), "Start some orange shit."))
    {
        PassGo("Orange");
    }
    else if (GUI.Button (Rect (a - 80, b - 60, 160, 20), "Start some blue shit."))
    {
        PassGo("BikeSeat");
    }
}

function PassGo(racer_name:String)
{
    var ic = GameObject.Find("InitialConfig");
    if(ic != null)
    {
        var script = ic.GetComponent(MonoBehaviour);
        script.SendMessage("SetGameParamsAndStart", racer_name);
    }
}