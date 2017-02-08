// The PayloadPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true, PayloadPanel: true*/

var PayloadPanel = (function() {
  var settings = {
    selectors: {
      payloadColumn: '#payload-column',
      payloadInitial: '#payload-initial-message',
      payloadRequest: '#payload-request',
      //payloadResponse: '#payload-response'
    },
    payloadTypes: {
      request: 'request',
      response: 'response'
    }
  };

  // Publicly accessible methods defined
  return {
    init: init,
    togglePanel: togglePanel
  };

  // Initialize the module
  function init() {
    payloadUpdateSetup();
  }

  // Toggle panel between being:
  // reduced width (default for large resolution apps)
  // hidden (default for small/mobile resolution apps)
  // full width (regardless of screen size)
  function togglePanel(event, element) {
    var payloadColumn = document.querySelector(settings.selectors.payloadColumn);
    if (element.classList.contains('full')) {
      element.classList.remove('full');
      payloadColumn.classList.remove('full');
    } else {
      element.classList.add('full');
      payloadColumn.classList.add('full');
    }
  }

  // Set up callbacks on payload setters in Api module
  // This causes the displayPayload function to be called when messages are sent / received
  function payloadUpdateSetup() {
    var currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function(newPayloadStr) {
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayPayload(settings.payloadTypes.request);
    };

    var currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function(newPayload) {
      currentResponsePayloadSetter.call(Api, newPayload);
      displayPayload(settings.payloadTypes.response);
    };
  }

  // Display a request or response payload that has just been sent/received
  function displayPayload(typeValue) {
    var isRequest = checkRequestType(typeValue);
    if (isRequest !== null) {
      // Create new payload DOM element
      var payloadDiv = buildPayloadDomElement(isRequest);
      var payloadElement = document.querySelector(isRequest
              ? settings.selectors.payloadRequest : settings.selectors.payloadResponse);
      // Clear out payload holder element
      while (payloadElement.lastChild) {
        payloadElement.removeChild(payloadElement.lastChild);
      }
      // Add new payload element
      payloadElement.appendChild(payloadDiv);
      // Set the horizontal rule to show (if request and response payloads both exist)
      // or to hide (otherwise)
      var payloadInitial = document.querySelector(settings.selectors.payloadInitial);
      if (Api.getRequestPayload() || Api.getResponsePayload()) {
        payloadInitial.classList.add('hide');
      }
    }
  }

  // Checks if the given typeValue matches with the request "name", the response "name", or neither
  // Returns true if request, false if response, and null if neither
  // Used to keep track of what type of payload we're currently working with
  function checkRequestType(typeValue) {
    if (typeValue === settings.payloadTypes.request) {
      return true;
    } else if (typeValue === settings.payloadTypes.response) {
      return false;
    }
    return null;
  }

  // Constructs new DOM element to use in displaying the payload
  function buildPayloadDomElement(isRequest) {
    var payloadPrettyString = jsonPrettyPrint(isRequest
            ? Api.getRequestPayload() : Api.getResponsePayload());

    var payloadJson = {
      'tagName': 'div',
      'children': [{
        // <div class='header-text'>
        'tagName': 'div',
        'text': isRequest ? 'Tos y Resfriado Común' : '',
        'classNames': ['header-text']
      }, {
        // <div class='code-line responsive-columns-wrapper'>
        'tagName': 'div',
        'classNames': ['code-line', 'responsive-columns-wrapper'],
        'children': [ {
          // <div class='payload-text responsive-column'>
          'tagName': 'pre',
          'classNames': ['payload-text', 'responsive-column'],
          'text': '<p> </p> <p>La tos y los resfriados son expermientados por la mayoría de los adultos de dos a cuatro veces al año y con mayor frecuencia por los niños. No es necesario que usted consulte a un médico si usted está teniendo síntomas de una infección viral sin complicaciones en el tracto respiratorio (orejas, nariz y senos paranasales, garganta y pecho). Por otro lado, su médico debe evaluar si usted tiene síntomas que sugieren una causa más seria, como una infección bacteriana, o si sus síntomas no son manejables con remedios sin receta o el paso del tiempo. El propósito de esta guía es revisar sus síntomas de tos y resfriado e identificar patrones específicos de enfermedad para los cuales se recomienda la evaluación de un médico.</p> <p>Usted encontrará una serie de preguntas sobre sus síntomas a medida que avanza a través de este programa. Sus respuestas a estas preguntas le ayudarán a dar sugerencias más pertinentes para usted.</p> <p>Las infecciones del tracto respiratorio superior e inferior suelen causar varios síntomas simultáneamente. Aún así, un síntoma probablemente domina su enfermedad. La identificación de su síntoma más dominante puede ser una buena manera para que comencemos.</p>'

        }]
      }]
    };

    return Common.buildDomElement(payloadJson);
  }

  // Format (payload) JSON to make it more readable
  function jsonPrettyPrint(json) {
    if (json === null) {
      return '';
    }
    var convert = JSON.stringify(json, null, 2);

    convert = convert.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(
      />/g, '&gt;');
    convert = convert
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function(match) {
          var cls = 'number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key';
            } else {
              cls = 'string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return '<span class="' + cls + '">' + match + '</span>';
        });
    return convert;
  }


}());
