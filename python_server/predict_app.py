import base64
import numpy as np 
import io
from PIL import Image
import keras
from keras import backend as k
import cv2


from keras.models import Sequential
from keras.models import load_model
from keras.preprocessing.image import ImageDataGenerator
from keras.preprocessing.image import img_to_array
from flask import request
from flask import jsonify
from flask import Flask
import tensorflow as tf 
global graph,model
graph=tf.get_default_graph()


app=Flask(__name__)


#def get_model():
#global model
model=load_model("beetermodel.hdf5")
print("**Model loaded***")


def preprocess_image(image,target_size):
    if image.mode !="RGB":
        image=image.convert("RGB")
    image=image.resize(target_size)
    image=img_to_array(image,dtype = np.float32)
    image=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
    image=image/255.0
    print(image)
    #image=np.expand_dims(image,axis=0)
    image=np.reshape(image,(1,224,224,1))

    print(image.shape)
    print(image)
    return image


print("**loading keares model**")



@app.route('/predict',methods=["POST"])
def predict():
    print('hello')
    message=request.get_json(force=True)
    encoded=message['image'] 
    encoded=encoded.split(",")[1]
    print(len(encoded))
    decode=base64.b64decode(encoded)
    image=Image.open(io.BytesIO(decode))
    preprocessed_image=preprocess_image(image,target_size=(224,224))
    #prediction=model.predict(preprocessed_image).tolist()
    with graph.as_default():
        prediction=model.predict(preprocessed_image).tolist()
    print(prediction)
    response={
        'prediction':
            {
        'ok': prediction[0][0],
        'fault': prediction[0][1] }

        }
    print("go response")
    return jsonify(response)
        
    
    
if __name__ == "__main__":
    app.run("0.0.0.0", "5000", debug=True)

