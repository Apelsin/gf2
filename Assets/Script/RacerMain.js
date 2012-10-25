#pragma strict
var RacerName:String = "Orange";
private var PreviousRacerName: String = RacerName;
private var Racers = {};
private var CurrentRacer:GameObject; 

function SelectRacer(name:String)
{
    if(Racers.ContainsKey(name))
    {
        CurrentRacer = Racers[name];
        for(var r in Racers)
            (r.Value as GameObject).SetActiveRecursively(r.Key == name);
        RacerName = name;
    }
}

function Start() {
    Racers["Orange"] = GameObject.Find("Orange") as GameObject;
    Racers["BikeSeat"] = GameObject.Find("BikeSeat") as GameObject;
    SelectRacer(RacerName);
}

function Update () {
    if(RacerName != PreviousRacerName)
        SelectRacer(RacerName);
}