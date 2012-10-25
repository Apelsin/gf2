#pragma strict
var RacerName;
var scene_current: String;

function Start () {
}

function Update () {
    if(scene_current != Application.loadedLevelName)
    {
        Debug.Log("Scene is: " + Application.loadedLevelName);
        if(Application.loadedLevelName == "Main Gameplay")
            SetupGame();
        scene_current = Application.loadedLevelName;
    }
}

function SetGameParamsAndStart(racer_name:String)
{
    RacerName = racer_name;
    Application.LoadLevel("Main Gameplay");
}

function SetupGame()
{
    var racer = GameObject.Find("Racer");
    Debug.Log(racer);
    if(racer != null)
    {
        var script = racer.GetComponent(MonoBehaviour);
        script.SendMessage("SelectRacer", RacerName);
    }
}

function Awake ()
{
    DontDestroyOnLoad (this.transform.gameObject);   
}