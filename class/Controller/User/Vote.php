<?php

namespace election\Controller\User;

use election\Factory\Vote as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Vote extends \election\Controller\User\Base
{
    public function post(\Canopy\Request $request)
    {
        if (!$request->isVar('command')) {
            throw new \Exception('Unknown Vote command');
        }

        $command = $request->getVar('command');
        switch ($command) {
            case 'save':
                $json = Factory::post($this->student);
                break;

            default:
                throw new \Exception('Unknown Vote command');
        }

        $view = new \phpws2\View\JsonView($json);
        $response = new \Canopy\Response($view);
        return $response;
    }
}
