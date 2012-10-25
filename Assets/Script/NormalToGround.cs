//I found this on the internet! It may be what we need. -Gavin


using UnityEngine;
using System.Collections;

public class NormalToGround : MonoBehaviour
{


	
// First off, make sure that you are freezing the rotation
// of the rigidbody since we are doing that manually now.

// This determines how fast the rigidbody rotates towards the correct value
	public float dampingRate;
// This determines how far it can detect the ground from
	public float rayLength;
// Set this up with the correct 'ground' layers
	public LayerMask mask;
	
	// Use this for initialization
	void Start ()
	{
	
	}
	
	Vector3 currentUp = Vector3.up;

	void FixedUpdate ()
	{
		RaycastHit hit;
		if (Physics.Raycast (transform.position, -currentUp, out hit, rayLength, mask)) {
			currentUp = hit.normal;
		}
		Quaternion targetRotation = transform.rotation;
		if (rigidbody.velocity.magnitude > 0) {
			targetRotation = Quaternion.LookRotation (rigidbody.velocity, currentUp);
		}
		rigidbody.rotation = Quaternion.Slerp (rigidbody.rotation, targetRotation, Time.deltaTime * dampingRate);
	}
}

