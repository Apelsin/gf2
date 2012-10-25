#pragma strict

private var StartTime : float = 0;
private var LastTime: String = "";
private var TextTime: String = "";

function Start () {

}

function OnGUI () {
    if (StartTime > 0)
    {   
         GUI.color = Color.black;
         
         var guiTime = Time.time - StartTime;
         
         var minutes : int =  guiTime / 60;
         var seconds : int =  guiTime % 60;
         var fraction : int = (guiTime * 1000) % 1000;

         TextTime = String.Format ("{0:00}:{1:00}:{2:000}", minutes, seconds, fraction); 
         var cur_lap_tt:String = "Current lap: " + TextTime;
         
         var dongle = new Rect (10, 10, 200, 30);
         var dongle2 = new Rect (Screen.width - 140, 10, 140, 30);
         
         GUI.color = Color.black;
         GUI.Label(dongle, cur_lap_tt);
         dongle.x -= 1;
         dongle.y -= 1;
         GUI.color = Color.white;
         GUI.Label(dongle, cur_lap_tt); 
         
         GUI.color = Color.black;
         GUI.Label(dongle2, LastTime);
         dongle2.x -= 1;
         dongle2.y -= 1;
         GUI.color = Color.white;
         GUI.Label(dongle2, LastTime);
         
     }
}

function OnTriggerEnter(o:Collider)
{
    if(o.gameObject.tag == "ArchwayTrigger")
    {
        if(StartTime > 0)
            LastTime = "Last time: " + TextTime;
        StartTime = Time.time;
    }
}