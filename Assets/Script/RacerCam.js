var Target : GameObject;
//var heightTheta = 10.0;
//var heightLoTheta = 5.0;
//var heightHiTheta= 35.0;
//var heightDamping = 0.5;
//var rotationDamping = 4.0;
var CameraOffset : Vector3;
var LookUp = 3.0;
var FOV = 80.0;
var FOVENHANCE = 20.0;
//var prev1Height = Mathf.Infinity;

private var hz:float;
private var vt:float;

@script AddComponentMenu("Camera-Control/RacerCam")

function TanH(x:float)
{
    x = Mathf.Pow(2.718, 2.0 * x);
    return (x - 1.0) / (x + 1.0);
}

function LateUpdate () {
 if (!Target)
     return;
 
 //var height = distance * Mathf.Sin(Mathf.Deg2Rad * heightTheta);
 //var transform_lo = distance * Mathf.Sin(Mathf.Deg2Rad * heightLoTheta);
 //var transform_hi = distance * Mathf.Sin(Mathf.Deg2Rad * heightHiTheta);
 
 //var wantedRotationAngle = target.transform.eulerAngles.y;
 //var wantedHeight = target.transform.position.y + height;
 //Debug.Log("wantedHeight = " + wantedHeight);
 
 //var currentRotationAngle = transform.eulerAngles.y;
 
 //if(prev1Height == Mathf.Infinity)
 //   prev1Height = transform.position.y + height;
 //var currentHeight;
 //currentHeight = transform.position.y;
 //currentHeight = Mathf.Clamp(currentHeight,
 //                            target.transform.position.y + transform_lo,
 //                            target.transform.position.y + transform_hi);
 //currentHeight = Mathf.Lerp (prev1Height, currentHeight, heightDamping * Time.deltaTime);
 
 // Control input smoothed out
 // HUGE hack
 //hz = FunStuff.IOSmooth(hz, Input.GetAxis("Horizontal"), rotationDamping);
 //vt = IOSmooth(vt, Input.GetAxis("Vertical"));
 
 //currentRotationAngle = wantedRotationAngle - hz * 1000.0 * Mathf.Deg2Rad;
 
 var targetVelocity = Target.rigidbody.velocity;
 var localVelocity: Vector3 = Target.transform.InverseTransformDirection(targetVelocity);
 
 var maffs = TanH(Mathf.Abs(localVelocity.z / 200.0));
 camera.fieldOfView = FOV + FOVENHANCE * maffs;
 
 //Debug.Log(camera.fieldOfView);
 
 //Debug.Log(hz);
 
 var currentRotation = Target.transform.rotation; //Quaternion.Euler(0, currentRotationAngle, 0);
 
 transform.position = Target.transform.position;
 transform.position += currentRotation * CameraOffset;
 
 transform.LookAt (Target.transform.position + Target.transform.rotation * Vector3.up * LookUp, Target.transform.up);
}