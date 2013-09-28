<?php
namespace Wstats;

class History
{
    const URL = 'http://www.wanikani.com/api/user';

    protected static $firstRadicals = array();

    protected $apiKey;

    public static function init()
    {
        History::$firstRadicals = array(
            1 => 'barb',
            2 => 'child',
            3 => 'antennae',
            4 => 'alligator',
            5 => 'axe',
            6 => 'angel',
            7 => 'bird',
            8 => 'boobs',
            9 => 'brush',
            10 => 'alcohol',
            11 => 'bear',
            12 => 'big-bird',
            13 => 'books',
            14 => 'bar',
            15 => 'cemetery',
            16 => 'glue',
            17 => 'comfort',
            18 => 'conflict',
            19 => 'become',
            20 => 'arrows',
            21 => 'angle',
            22 => 'ability',
            23 => 'clothes',
            24 => 'accept',
            25 => 'bot',
            26 => 'announce',
            27 => 'change',
            28 => 'giant',
            29 => 'above',
            30 => 'joker',
            31 => 'bookshelf',
            32 => 'beforehand',
            33 => 'inside',
            34 => 'catapult',
            35 => 'belt',
            36 => 'bright',
            37 => 'omen',
            38 => 'have',
            39 => 'buddy',
            40 => 'employ',
            41 => 'cactus',
            42 => 'bone',
            43 => 'business',
            44 => 'blade',
            45 => 'again',
            46 => 'favor',
            47 => 'task',
            48 => 'form',
            49 => 'crab-trap',
            50 => 'name',
        );
    }

    public function __construct($apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function load()
    {
        //return $this->processData(
            //require ROOT . '/test.php'
        //);
        $ch = curl_init($this->resourceUrl('radicals'));
        curl_setopt_array($ch, array(
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 60,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_RETURNTRANSFER => true,
        ));
        $response = curl_exec($ch);
        if ($response === false) {
            $message = sprintf(
                'cURL error, code: %d, message: %s',
                curl_errno($ch),
                curl_error($ch)
            );
            curl_close($ch);
            throw new \RuntimeException($message);
        }
        $metadata = curl_getinfo($ch);
        curl_close($ch);
        if ($metadata['http_code'] == 403) {
            throw new \RuntimeException('API request limit exceeded');
        }
        $response = json_decode($response, true);
        if (is_null($response)) {
            throw new \RuntimeException(
                'Error decoding JSON response: '
                . $this->getJsonErrorMessage(json_last_error())
            );
        }
        if (isset($response['error'])) {
            return array(
                'success' => false,
                'error' => $response['error']['message'],
            );
        }
        return $this->processData($response);
    }

    protected function processData(array $jsonData)
    {
        $userLevel = $jsonData['user_information']['level'];
        if ($userLevel == 1) {
            return array(
                'success' => false,
                'error' => 'History is available only after reaching level 2',
            );
        }
        $radicalMap = array_flip(static::$firstRadicals);
        $history = array();
        foreach ($jsonData['requested_information'] as $radical) {
            if (isset($radicalMap[$radical['meaning']])) {
                if (isset($radical['stats'])) {
                    $history[$radical['level']] = array(
                        'date' => $radical['stats']['unlocked_date'],
                    );
                }
            }
        }
        $average = 0;
        foreach ($history as $level => &$record) {
            if (isset($history[$level + 1])) {
                $record['took'] = $history[$level + 1]['date'] - $record['date'];
                $average += $record['took'];
            }
        }
        $average = (int)($average / ($userLevel - 1));
        unset($record);
        $date = $history[$userLevel]['date'];
        for ($level = $userLevel; $level < 51; $level++) {
            $history[$level]['took'] = $average;
            if ($level > $userLevel) {
                $date += $average;
                $history[$level]['date'] = $date;
            }
        }

        return array(
            'success' => true,
            'userLevel' => $userLevel,
            'history' => $history,
        );
    }

    protected function resourceUrl($resource)
    {
        return static::URL . '/' . $this->apiKey . '/' . $resource;
    }

    protected function getJsonErrorMessage($code)
    {
        switch ($code) {
            case JSON_ERROR_NONE:
                return 'No errors';
            case JSON_ERROR_DEPTH:
                return 'Maximum stack depth exceeded';
            case JSON_ERROR_STATE_MISMATCH:
                return 'Underflow or the modes mismatch';
            case JSON_ERROR_CTRL_CHAR:
                return 'Unexpected control character found';
            case JSON_ERROR_SYNTAX:
                return 'Syntax error, malformed JSON';
            case JSON_ERROR_UTF8:
                return 'Malformed UTF-8 characters, possibly incorrectly encoded';
            default:
                return 'Unknown error';
        }
    }
}

History::init();
