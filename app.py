from flask import Flask, render_template, request, redirect, Response, jsonify, send_file
import numpy as np
import pandas as pd
import json
import math
import csv
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import euclidean_distances
from sklearn.manifold import MDS
from operator import itemgetter
from collections import Counter
import matplotlib.pyplot as plt
import random

app = Flask(__name__)



@app.route("/")
def index():
    return render_template("index.html")



if __name__ == "__main__":
    app.run(port=5105)
    app.run(debug=True)

   
   
   
   
   
   
   
   
   
   