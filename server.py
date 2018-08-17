from flask import Flask, request, send_from_directory, render_template, g, redirect, url_for, session, jsonify, make_response, send_file
import random

app = Flask(__name__, static_url_path='')

dataSections = dict()
global global_index
startTime = 14040
nodeDict = dict()
statuStore = dict()


@app.route('/index')
@app.route('/')
def index(name=None):
    return render_template('index.html')

@app.route('/js/<path:path>')
def send_js(path):
    ''' Returns a file from the reports dir '''
    return send_from_directory('./js', path)

@app.route('/css/<path:path>')
def send_css(path):
    ''' Returns a file from the reports dir '''
    return send_from_directory('./css', path)
 
@app.route('/file/<path:path>')
def send_file(path):
    ''' Returns a file from the reports dir '''
    return send_from_directory('./file', path)

@app.route('/fonts/<path:path>')
def send_font(path):
    ''' Returns a file from the reports dir '''
    return send_from_directory('./fonts', path)

@app.route('/images/<path:path>')
def send_image(path):
    ''' Returns a file from the reports dir '''
    return send_from_directory('./images', path)


@app.route('/restart')
def restart():
	global global_index
	global_index = startTime
	
	result = dict()
	result["restart"] ="restart success" 
	print global_index
	return jsonify(result)



@app.route('/getjson', methods = ['GET', 'POST'])
def getjson():
	a = request.json
	#print range(a["start"],a["end"] + 1)
	#global global_index
	bulk = []
	cou = range(a["start"],a["end"] + 1)
	
	reduceDict = dict() 
	statuStore['nodes'] = dict()
	statuStore['edges'] = dict()
	
	infoStore = dict()
	for x in cou:
		bulk = bulk + dataSections[x]
		#print x
    
	for meta in bulk:

		statuStore['nodes'][nodeDict[meta['source']]] = 5
		statuStore['nodes'][nodeDict[meta['target']]] = 5

	    ##################################

		if nodeDict[meta['source']] in infoStore:
			infoStore[nodeDict[meta['source']]][0] += 1
		else:
			infoStore[nodeDict[meta['source']]] = [1,0,meta['source'],random.randint(1,3),random.randint(1,5),random.randint(1,5)]


		if nodeDict[meta['target']] in infoStore:
			infoStore[nodeDict[meta['target']]][1] += 1
		else:
			#
			infoStore[nodeDict[meta['target']]] = [0,1,meta['target'],random.randint(1,3),random.randint(1,5),random.randint(1,5)]

		##################################

		edgeName = str(nodeDict[meta['source']]) + '&' + str(nodeDict[meta['target']])
		if reduceDict.has_key(edgeName):
			reduceDict[edgeName][0] += 1
			reduceDict[edgeName][1] += meta['inputFlow']
			reduceDict[edgeName][2] += meta['outputFlow']
		else:
			reduceDict[edgeName] = [1,meta['inputFlow'],meta['outputFlow']]

	dataArray = []

	for head in reduceDict:
		statuStore['edges'][head] = reduceDict[head]
		_list = head.split('&')
		source = _list[0]
		target = _list[1]
		dataArray.append([source,target,reduceDict[head]])


	result = dict()

	result['links'] = dataArray

	result['info'] = infoStore

	result['flow'] = bulk

	return jsonify(result)
    

@app.route('/update')
def update():

	global global_index

	print global_index

	if not dataSections.has_key(global_index):
		global_index += 1
		return 'No Update'

	results = dict()
	results['nodes'] = dict()
	results['nodes']['add'] = []
	results['nodes']['delete'] = []
	
	results['edges'] = dict()
	results['edges']['add'] = []
	results['edges']['delete'] = []
	results['edges']['modify'] = []
	
	reduceDict = dict() 
	reduceDict['nodes'] = dict()
	reduceDict['edges'] = dict()

	bulk = dataSections[global_index]

	infoStore = dict()

	for meta in bulk:
		reduceDict['nodes'][nodeDict[meta['source']]] = 1
		reduceDict['nodes'][nodeDict[meta['target']]] = 1
		edgeName = str(nodeDict[meta['source']]) + '&' + str(nodeDict[meta['target']])

		####################################

		if nodeDict[meta['source']] in infoStore:
			infoStore[meta['source']][0] += 1
		else:
			infoStore[meta['source']] = [1,0]


		if nodeDict[meta['target']] in infoStore:
			infoStore[meta['target']][1] += 1
		else:
			infoStore[meta['target']] = [0,1]

		results['info'] = infoStore

		####################################
		

		if reduceDict['edges'].has_key(edgeName):
			reduceDict['edges'][edgeName] += 1
		else:
			reduceDict['edges'][edgeName] = 1

	for head in reduceDict['nodes']:
		if not statuStore['nodes'].has_key(head):
			results['nodes']['add'].append(head)
			statuStore['nodes'][head] = 5
		else:
			statuStore['nodes'][head] += 1

	DELETE_NODES = []

	for head in statuStore['nodes']:
		if not reduceDict['nodes'].has_key(head):
			if statuStore['nodes'][head] <= 0:
				results['nodes']['delete'].append(head)
				DELETE_NODES.append(head)
			else:
				statuStore['nodes'][head] -= 1

	for i in range(len(DELETE_NODES)):
		del statuStore['nodes'][DELETE_NODES[i]]

	DELETE_EDGES = []

	for head in reduceDict['edges']:
		if statuStore['edges'].has_key(head):
			if reduceDict['edges'][head] != statuStore['edges'][head]:
				results['edges']['modify'].append(head)
		else:
			results['edges']['add'].append(head)
			statuStore['edges'][head] = 1
		
	for head in statuStore['edges']:
		if not reduceDict['edges'].has_key(head):
			results['edges']['delete'].append(head)
			DELETE_EDGES.append(head)

	for i in range(len(DELETE_EDGES)):
		del statuStore['edges'][DELETE_EDGES[i]]

	global_index += 1

	print len(statuStore['nodes'])
	print len(statuStore['edges'])

	return jsonify(results)


@app.route('/first')
def firstLayout():

	global global_index

	reduceDict = dict() 

	statuStore['nodes'] = dict()
	statuStore['edges'] = dict()
	
	bulk = dataSections[global_index]

	infoStore = dict()
    
	for meta in bulk:

		statuStore['nodes'][nodeDict[meta['source']]] = 5
		statuStore['nodes'][nodeDict[meta['target']]] = 5

	    ##################################

		if nodeDict[meta['source']] in infoStore:
			infoStore[nodeDict[meta['source']]][0] += 1
		else:
			infoStore[nodeDict[meta['source']]] = [1,0,meta['source'],random.randint(1,3),random.randint(1,5),random.randint(1,5)]


		if nodeDict[meta['target']] in infoStore:
			infoStore[nodeDict[meta['target']]][1] += 1
		else:
			#
			infoStore[nodeDict[meta['target']]] = [0,1,meta['target'],random.randint(1,3),random.randint(1,5),random.randint(1,5)]

		##################################

		edgeName = str(nodeDict[meta['source']]) + '&' + str(nodeDict[meta['target']])
		if reduceDict.has_key(edgeName):
			reduceDict[edgeName][0] += 1
			reduceDict[edgeName][1] += meta['inputFlow']
			reduceDict[edgeName][2] += meta['outputFlow']
		else:
			reduceDict[edgeName] = [1,meta['inputFlow'],meta['outputFlow']]

	dataArray = []

	for head in reduceDict:
		statuStore['edges'][head] = reduceDict[head]
		_list = head.split('&')
		source = _list[0]
		target = _list[1]
		dataArray.append([source,target,reduceDict[head]])

	global_index += 1

	result = dict()

	result['links'] = dataArray

	result['info'] = infoStore

	result['flow'] = bulk

	return jsonify(result)


def init():

	print 'Loading\n'

	global global_index
	global_index = startTime

	data = file('./part-1-processed-all.csv')

	for line in data:
		meta = line.split(',')
		stamp = int(meta[0])
		minute = int(stamp/10)
		source = meta[1]
		target = meta[2]
		#hostType = random.randint(1,3)
		inputFlow = random.randint(0,9999)
		outputFlow = random.randint(0,9999)
        #paralysisLevel = random.randint(1,5)
        #controlLevel = random.randint(1,5)
		#if source.split('.')[0] == '10':
		#	if target.split('.')[0] == '10':

		if not nodeDict.has_key(source):
			nodeDict[source] = len(nodeDict)

		if not nodeDict.has_key(target):
			nodeDict[target] = len(nodeDict)

		d = dict()
		d['source'] = source
		d['target'] = target
		#d['hostType'] = hostType
		d['inputFlow'] = inputFlow
		d['outputFlow'] = outputFlow
		#d['paralysisLevel'] = paralysisLevel
		#d['controlLevel'] = controlLevel

		if dataSections.has_key(minute):
			dataSections[minute].append(d)
		else:
			dataSections[minute] = []
			dataSections[minute].append(d)

	print 'Server is ready\n'


if __name__ == "__main__":
	init()
	app.run(host='0.0.0.0',debug=True)
