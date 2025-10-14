namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Room;

class AdminRoomPageController extends Controller
{
    public function index()
    {
        $rooms = Room::all();
        return Inertia::render('admin/KelolaKamarAdminPage', [
            'rooms' => $rooms,
        ]);
    }
}
