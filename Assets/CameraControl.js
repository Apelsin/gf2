var target : Transform;
var distance = 10.0;
var heightTheta = 10.0;
var heightLoTheta = 5.0;
var heightHiTheta= 35.0;
var heightDamping = 0.5;
var rotationDamping = 0.5;
var lookUp = 3.0;
//var prev1Height = Mathf.Infinity;

@script AddComponentMenu("Camera-Control/CameraControl")

function LateUpdate () {
 if (!target)
     return;
 
 var height = distance * Mathf.Sin(Mathf.Deg2Rad * heightTheta);
 var transform_lo = distance * Mathf.Sin(Mathf.Deg2Rad * heightLoTheta);
 var transform_hi = distance * Mathf.Sin(Mathf.Deg2Rad * heightHiTheta);
 
 var wantedRotationAngle = target.eulerAngles.y;
 var wantedHeight = target.position.y + height;
 //Debug.Log("wantedHeight = " + wantedHeight);
 
 var currentRotationAngle = transform.eulerAngles.y;
 
 //if(prev1Height == Mathf.Infinity)
 //   prev1Height = transform.position.y + height;
 var currentHeight;
 currentHeight = transform.position.y;
 currentHeight = Mathf.Clamp(currentHeight, target.position.y + transform_lo, target.position.y + transform_hi);
 //currentHeight = Mathf.Lerp (prev1Height, currentHeight, heightDamping * Time.deltaTime);
 
 
 //currentRotationAngle = Mathf.LerpAngle (currentRotationAngle, wantedRotationAngle, rotationDamping * Time.deltaTime);
 currentRotationAngle =
    //Mathf.LerpAngle(
    //currentRotationAngle,
    wantedRotationAngle - Input.GetAxis("Horizontal") * 1000.0 * Mathf.Deg2Rad * rotationDamping;//,
    //rotationDamping * Time.deltaTime);

 //currentHeight = Mathf.Lerp (currentHeight, wantedHeight,  heightDamping * Time.deltaTime);
 //prev1Height = currentHeight;
 
 var currentRotation = Quaternion.Euler (0, currentRotationAngle, 0);
 
 transform.position = target.position;
 transform.position -= currentRotation * Vector3.forward * distance;

 transform.position.y = currentHeight;
 
 transform.LookAt (target.position + target.rotation * Vector3.up * lookUp);
}